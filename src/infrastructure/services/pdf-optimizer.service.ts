
import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class PdfOptimizerService {
  private readonly logger = new Logger(PdfOptimizerService.name);

  /**
   * Otimiza um arquivo PDF para reduzir seu tamanho
   * @param pdfBuffer Buffer do PDF original
   * @param compressionLevel Nível de compressão (0-1), sendo 1 o maior nível
   * @returns Buffer do PDF otimizado
   */
  async optimizePdf(pdfBuffer: Buffer, compressionLevel: number = 0.5): Promise<Buffer> {
    const startTime = Date.now();
    this.logger.log(`Iniciando otimização de PDF: ${pdfBuffer.length / 1024} KB`);

    try {
      // Carregar o PDF
      const pdfDoc = await PDFDocument.load(pdfBuffer, {
        ignoreEncryption: true,
      });

      // Aplicar configurações de compressão
      const optimizedPdf = await pdfDoc.save({
        useObjectStreams: true,         // Reduz o tamanho de arquivo significativamente
        addDefaultPage: false,          // Não adicionar página padrão se o PDF estiver vazio
        updateFieldAppearances: false   // Não atualizar aparências de campos de formulário
      });

      const compressionRatio = pdfBuffer.length / optimizedPdf.length;
      const totalTime = Date.now() - startTime;
      
      this.logger.log(
        `PDF otimizado em ${totalTime}ms: ${pdfBuffer.length / 1024} KB -> ${optimizedPdf.length / 1024} KB ` +
        `(taxa de compressão: ${compressionRatio.toFixed(2)}x)`
      );

      return Buffer.from(optimizedPdf);
    } catch (error) {
      this.logger.error(`Erro ao otimizar PDF: ${error.message}`, error.stack);
      // Retorna o buffer original se houver erro
      return pdfBuffer;
    }
  }

  /**
   * Reduz a qualidade das imagens em um PDF para diminuir seu tamanho
   * Observação: Esta função requer módulos adicionais para processamento avançado de PDF
   * @param pdfBuffer Buffer do PDF original
   * @returns Buffer do PDF com imagens de qualidade reduzida
   */
  async reduceImageQuality(pdfBuffer: Buffer): Promise<Buffer> {
    // Este método requer implementação adicional com bibliotecas específicas
    // como ghostscript ou qpdf em ambientes Node.js
    this.logger.warn('reduceImageQuality: Método ainda não implementado completamente');
    return pdfBuffer;
  }
}