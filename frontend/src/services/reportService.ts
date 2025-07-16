// 📊 Serviço de Relatórios e Exportação
// Arquivo: frontend/src/services/reportService.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface ReportData {
  title: string;
  subtitle?: string;
  data: any[];
  headers?: string[];
  filters?: Record<string, any>;
  generatedAt?: Date;
  author?: string;
}

interface ChartExportOptions {
  elementId: string;
  filename: string;
  title?: string;
  format?: 'pdf' | 'png';
}

// Configurações padrão
const DEFAULT_CONFIG = {
  author: 'Sistema HR MVP',
  company: 'HR Management System',
  logo: null, // Pode ser adicionado futuramente
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#10b981',
    danger: '#ef4444',
  },
};

class ReportService {
  // ===============================================================
  // EXPORTAÇÃO PDF
  // ===============================================================

  /**
   * Exportar dados para PDF
   */
  async exportToPDF(reportData: ReportData, options?: {
    orientation?: 'portrait' | 'landscape';
    format?: 'a4' | 'letter';
  }): Promise<void> {
    try {
      console.log('📄 Iniciando exportação PDF:', reportData.title);

      const doc = new jsPDF({
        orientation: options?.orientation || 'portrait',
        format: options?.format || 'a4',
        unit: 'mm',
      });

      // Configurar fonte
      doc.setFont('helvetica');

      // Cabeçalho
      this.addPDFHeader(doc, reportData);

      // Filtros aplicados (se existirem)
      let currentY = 50;
      if (reportData.filters) {
        currentY = this.addPDFFilters(doc, reportData.filters, currentY);
      }

      // Tabela de dados
      if (reportData.data.length > 0) {
        this.addPDFTable(doc, reportData, currentY);
      }

      // Rodapé
      this.addPDFFooter(doc, reportData);

      // Salvar arquivo
      const filename = `${this.sanitizeFilename(reportData.title)}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      doc.save(filename);

      console.log('✅ PDF exportado com sucesso:', filename);
    } catch (error) {
      console.error('❌ Erro ao exportar PDF:', error);
      throw new Error('Erro ao gerar relatório PDF');
    }
  }

  /**
   * Exportar gráfico para PDF
   */
  async exportChartToPDF(options: ChartExportOptions): Promise<void> {
    try {
      console.log('📊 Exportando gráfico para PDF:', options.filename);

      const element = document.getElementById(options.elementId);
      if (!element) {
        throw new Error(`Elemento ${options.elementId} não encontrado`);
      }

      // Capturar elemento como imagem
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      // Criar PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        format: 'a4',
        unit: 'mm',
      });

      // Adicionar título
      if (options.title) {
        doc.setFontSize(16);
        doc.setTextColor(DEFAULT_CONFIG.colors.primary);
        doc.text(options.title, 20, 20);
      }

      // Adicionar imagem
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 250;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(DEFAULT_CONFIG.colors.secondary);
      doc.text(
        `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - ${DEFAULT_CONFIG.company}`,
        20,
        doc.internal.pageSize.height - 10
      );

      // Salvar
      const filename = `${this.sanitizeFilename(options.filename)}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      doc.save(filename);

      console.log('✅ Gráfico exportado para PDF:', filename);
    } catch (error) {
      console.error('❌ Erro ao exportar gráfico para PDF:', error);
      throw new Error('Erro ao exportar gráfico para PDF');
    }
  }

  // ===============================================================
  // EXPORTAÇÃO CSV
  // ===============================================================

  /**
   * Exportar dados para CSV usando PapaParse
   */
  async exportToCSV(reportData: ReportData, options?: {
    delimiter?: string;
    encoding?: string;
  }): Promise<void> {
    try {
      console.log('📋 Iniciando exportação CSV:', reportData.title);
      console.log('📋 Dados recebidos:', reportData.data);

      if (!reportData.data || reportData.data.length === 0) {
        throw new Error('Nenhum dado para exportar');
      }

      // Configurar PapaParse
      const csvConfig = {
        delimiter: options?.delimiter || ',',
        header: true,
        skipEmptyLines: true,
        encoding: options?.encoding || 'utf-8',
      };

      // Converter dados para CSV
      const csv = Papa.unparse(reportData.data, csvConfig);
      
      console.log('📋 CSV gerado:', csv.substring(0, 500) + '...');

      // Adicionar BOM para UTF-8 (compatibilidade com Excel)
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csv;

      // Criar blob e fazer download
      const blob = new Blob([csvWithBOM], { 
        type: 'text/csv;charset=utf-8;' 
      });

      const filename = `${this.sanitizeFilename(reportData.title)}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      saveAs(blob, filename);

      console.log('✅ CSV exportado com sucesso:', filename);
    } catch (error) {
      console.error('❌ Erro ao exportar CSV:', error);
      throw new Error('Erro ao gerar relatório CSV');
    }
  }

  // ===============================================================
  // EXPORTAÇÃO DE IMAGENS
  // ===============================================================

  /**
   * Exportar elemento como imagem PNG
   */
  async exportToPNG(elementId: string, filename: string): Promise<void> {
    try {
      console.log('🖼️ Exportando para PNG:', filename);

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento ${elementId} não encontrado`);
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      // Converter para blob e fazer download
      canvas.toBlob((blob) => {
        if (blob) {
          const finalFilename = `${this.sanitizeFilename(filename)}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.png`;
          saveAs(blob, finalFilename);
          console.log('✅ PNG exportado com sucesso:', finalFilename);
        }
      }, 'image/png');

    } catch (error) {
      console.error('❌ Erro ao exportar PNG:', error);
      throw new Error('Erro ao exportar imagem');
    }
  }

  // ===============================================================
  // MÉTODOS AUXILIARES PARA PDF
  // ===============================================================

  private addPDFHeader(doc: jsPDF, reportData: ReportData): void {
    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(DEFAULT_CONFIG.colors.primary);
    doc.text(reportData.title, 20, 20);

    // Subtítulo (se existir)
    if (reportData.subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(DEFAULT_CONFIG.colors.secondary);
      doc.text(reportData.subtitle, 20, 30);
    }

    // Data de geração
    doc.setFontSize(10);
    doc.setTextColor(DEFAULT_CONFIG.colors.secondary);
    const dateText = `Gerado em: ${format(reportData.generatedAt || new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`;
    doc.text(dateText, 20, 40);

    // Linha separadora
    doc.setDrawColor(DEFAULT_CONFIG.colors.secondary);
    doc.line(20, 45, 190, 45);
  }

  private addPDFFilters(doc: jsPDF, filters: Record<string, any>, startY: number): number {
    doc.setFontSize(10);
    doc.setTextColor(DEFAULT_CONFIG.colors.secondary);
    doc.text('Filtros aplicados:', 20, startY);

    let currentY = startY + 7;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const filterText = `• ${key}: ${value}`;
        doc.text(filterText, 25, currentY);
        currentY += 5;
      }
    });

    return currentY + 5;
  }

  private addPDFTable(doc: jsPDF, reportData: ReportData, startY: number): void {
    if (!reportData.data || reportData.data.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Nenhum dado disponível para exibir', 20, startY);
      return;
    }

    const headers = reportData.headers || Object.keys(reportData.data[0] || {});
    const data = reportData.data.map(item => 
      headers.map(header => {
        const value = item[header];
        return value !== undefined && value !== null ? String(value) : '';
      })
    );

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: startY,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Azul primary
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 20, right: 20 },
    });
  }

  private addPDFFooter(doc: jsPDF, reportData: ReportData): void {
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFontSize(8);
    doc.setTextColor(DEFAULT_CONFIG.colors.secondary);
    
    // Linha separadora
    doc.line(20, pageHeight - 20, 190, pageHeight - 20);
    
    // Texto do rodapé
    doc.text(
      `${DEFAULT_CONFIG.company} - ${reportData.author || DEFAULT_CONFIG.author}`,
      20,
      pageHeight - 10
    );
    
    // Número da página
    doc.text(
      `Página ${doc.getCurrentPageInfo().pageNumber}`,
      150,
      pageHeight - 10
    );
  }

  // ===============================================================
  // UTILITÁRIOS
  // ===============================================================

  private sanitizeFilename(filename: string): string {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .toLowerCase();
  }

  /**
   * Formatar dados para exportação
   */
  formatDataForExport(data: any[], type: 'candidates' | 'jobs' | 'applications' | 'dashboard'): any[] {
    switch (type) {
      case 'candidates':
        return data.map(item => ({
          'Nome': item.name || (item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : 'N/A'),
          'Email': item.email || 'N/A',
          'Telefone': item.phone || 'N/A',
          'Posição': item.position || 'N/A',
          'Status': this.formatStatus(item.status),
          'Endereço': item.address || 'N/A',
          'Data de Cadastro': item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
        }));

      case 'jobs':
        return data.map(item => ({
          'Título': item.title || 'N/A',
          'Empresa': item.company || 'N/A',
          'Localização': item.location || 'N/A',
          'Tipo': item.employment_type || 'N/A',
          'Nível': item.experience_level || 'N/A',
          'Salário Min': item.salary_min ? `R$ ${Number(item.salary_min).toLocaleString()}` : 'N/A',
          'Salário Max': item.salary_max ? `R$ ${Number(item.salary_max).toLocaleString()}` : 'N/A',
          'Status': this.formatStatus(item.status),
          'Data de Criação': item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
        }));

      case 'applications':
        return data.map(item => ({
          'Candidato': item.candidates?.first_name && item.candidates?.last_name ? 
            `${item.candidates.first_name} ${item.candidates.last_name}` : 'N/A',
          'Email': item.candidates?.email || 'N/A',
          'Vaga': item.jobs?.title || 'N/A',
          'Empresa': item.jobs?.company || 'N/A',
          'Status': this.formatStatus(item.status),
          'Etapa': `${item.stage || 1} - ${this.getStageLabel(item.stage || 1)}`,
          'Data da Candidatura': item.applied_at ? format(new Date(item.applied_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
        }));

      case 'dashboard':
        // Para dados de dashboard, retornar como estão ou com formatação mínima
        return data.map(item => ({
          'Métrica': item.name || item.label || 'N/A',
          'Valor': item.value || item.count || 'N/A',
          'Período': item.period || item.month || 'N/A',
          'Categoria': item.category || item.type || 'N/A',
          'Data': item.date ? format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
        }));

      default:
        return data;
    }
  }

  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado',
      'interviewed': 'Entrevistado',
      'hired': 'Contratado',
      'applied': 'Candidatado',
      'in_progress': 'Em Processo',
    };

    return statusMap[status] || status;
  }

  private getStageLabel(stage: number): string {
    const stageLabels: Record<number, string> = {
      1: 'Candidatura Recebida',
      2: 'Triagem de Currículo',
      3: 'Validação Telefônica',
      4: 'Teste Técnico',
      5: 'Entrevista RH',
      6: 'Entrevista Técnica',
      7: 'Verificação de Referências',
      8: 'Proposta Enviada',
      9: 'Contratado',
    };

    return stageLabels[stage] || `Etapa ${stage}`;
  }
}

// Instância singleton
export const reportService = new ReportService();
export default reportService;