// Componente de Botão de Exportação
// Arquivo: frontend/src/components/Reports/ExportButton.tsx

import React, { useState } from 'react';
import {
  Download,
  FileText,
  Image,
  File,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { reportService } from '../../services/reportService';

interface ExportButtonProps {
  data: any[];
  title: string;
  subtitle?: string;
  type: 'candidates' | 'jobs' | 'applications' | 'dashboard';
  filters?: Record<string, any>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  chartElementId?: string; // Para exportação de gráficos
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  title,
  subtitle,
  type,
  filters,
  className = '',
  variant = 'primary',
  size = 'md',
  chartElementId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);

  // Configurações de estilo
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline:
      'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'png') => {
    try {
      setIsExporting(true);
      setExportingType(format);
      setIsOpen(false);

      console.log(`📊 Iniciando exportação ${format.toUpperCase()}:`, title);
      console.log('📊 Dados originais:', data);
      console.log('📊 Tipo:', type);

      const formattedData = reportService.formatDataForExport(data, type);
      console.log('📊 Dados formatados:', formattedData);

      const reportData = {
        title,
        subtitle,
        data: formattedData,
        filters,
        generatedAt: new Date(),
        author: 'Sistema HR MVP',
      };

      switch (format) {
        case 'pdf':
          await reportService.exportToPDF(reportData, {
            orientation: data.length > 5 ? 'landscape' : 'portrait',
          });
          break;

        case 'csv':
          await reportService.exportToCSV(reportData, {
            delimiter: ',',
            encoding: 'utf-8',
          });
          break;

        case 'png':
          if (chartElementId) {
            await reportService.exportToPNG(chartElementId, title);
          } else {
            throw new Error('ID do elemento não fornecido para exportação PNG');
          }
          break;

        default:
          throw new Error(`Formato ${format} não suportado`);
      }

      console.log(`Exportação ${format.toUpperCase()} concluída`);
    } catch (error: any) {
      console.error(`Erro na exportação ${format.toUpperCase()}:`, error);
      alert(`Erro ao exportar ${format.toUpperCase()}: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  const handleChartExport = async (format: 'pdf' | 'png') => {
    if (!chartElementId) {
      alert('ID do elemento do gráfico não fornecido');
      return;
    }

    try {
      setIsExporting(true);
      setExportingType(format);
      setIsOpen(false);

      if (format === 'pdf') {
        await reportService.exportChartToPDF({
          elementId: chartElementId,
          filename: title,
          title: title,
        });
      } else {
        await reportService.exportToPNG(chartElementId, title);
      }
    } catch (error: any) {
      console.error('Erro ao exportar gráfico:', error);
      alert(`Erro ao exportar gráfico: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  const exportOptions = [
    {
      key: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Documento formatado',
      action: () => (chartElementId ? handleChartExport('pdf') : handleExport('pdf')),
    },
    {
      key: 'csv',
      label: 'CSV',
      icon: File,
      description: 'Planilha de dados',
      action: () => handleExport('csv'),
      disabled: !!chartElementId,
    },
    {
      key: 'png',
      label: 'PNG',
      icon: Image,
      description: 'Imagem do gráfico',
      action: () => (chartElementId ? handleChartExport('png') : handleExport('png')),
      disabled: !chartElementId,
    },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Botão Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || data.length === 0}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
          ${data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exportando {exportingType?.toUpperCase()}...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Exportar
            <ChevronDown className="h-4 w-4 ml-1" />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isExporting && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Escolha o formato:</p>
                <p className="text-xs text-gray-500">{data.length} registros</p>
              </div>

              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={option.action}
                    disabled={option.disabled}
                    className={`
                      w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors
                      ${option.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Indicador de dados vazios */}
      {data.length === 0 && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-500">
          Nenhum dado para exportar
        </div>
      )}
    </div>
  );
};

export default ExportButton;
