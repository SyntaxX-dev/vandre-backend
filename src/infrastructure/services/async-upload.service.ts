import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as crypto from 'crypto';

@Injectable()
export class AsyncUploadService {
  private readonly logger = new Logger(AsyncUploadService.name);
  private readonly s3: S3;
  private uploadQueue: Map<string, { buffer: Buffer; contentType: string; key: string; }> = new Map();
  private processingQueue: boolean = false;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION || 'sa-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      httpOptions: {
        timeout: 300000,
        connectTimeout: 5000
      },
      maxRetries: 3
    });

    // Iniciar processamento da fila após 1 segundo
    setTimeout(() => this.processQueue(), 1000);
  }

  /**
   * Adiciona um arquivo à fila de upload assíncrono
   * @param buffer Buffer do arquivo
   * @param contentType Tipo de conteúdo (MIME type)
   * @param key Chave do S3 (caminho e nome do arquivo)
   * @returns Um token gerado para identificar o upload
   */
  async queueUpload(buffer: Buffer, contentType: string, key: string): Promise<string> {
    // Gerar um token único para este upload
    const token = crypto.randomBytes(16).toString('hex');
    
    // Adicionar à fila
    this.uploadQueue.set(token, {
      buffer,
      contentType,
      key
    });
    
    this.logger.log(`Upload adicionado à fila: ${key} (token: ${token})`);
    
    // Iniciar processamento da fila se ainda não estiver processando
    if (!this.processingQueue) {
      this.processQueue();
    }
    
    return token;
  }

  /**
   * Processa a fila de uploads em segundo plano
   */
  private async processQueue() {
    if (this.processingQueue || this.uploadQueue.size === 0) {
      return;
    }

    this.processingQueue = true;
    this.logger.log(`Iniciando processamento da fila de uploads: ${this.uploadQueue.size} arquivos pendentes`);

    try {
      // Processar cada upload na fila, um por vez
      for (const [token, uploadData] of this.uploadQueue.entries()) {
        try {
          await this.s3.upload({
            Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
            Key: uploadData.key,
            Body: uploadData.buffer,
            ContentType: uploadData.contentType,
          }).promise();
          
          this.logger.log(`Upload concluído: ${uploadData.key} (token: ${token})`);
          this.uploadQueue.delete(token);
        } catch (error) {
          this.logger.error(`Erro ao fazer upload de ${uploadData.key} (token: ${token}): ${error.message}`);
          // Manter na fila para tentar novamente na próxima execução
        }
      }
    } finally {
      this.processingQueue = false;
      
      // Se ainda houver uploads na fila, agendar nova execução em 5 segundos
      if (this.uploadQueue.size > 0) {
        setTimeout(() => this.processQueue(), 5000);
      }
    }
  }

  /**
   * Constrói a URL do S3 diretamente, sem precisar enviar o arquivo
   * @param key Chave do S3 (caminho e nome do arquivo)
   * @returns URL completa do objeto no S3
   */
  generateS3Url(key: string): string {
    const bucket = process.env.AWS_BUCKET_NAME || 'vandre-aws';
    const region = process.env.AWS_REGION || 'sa-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}