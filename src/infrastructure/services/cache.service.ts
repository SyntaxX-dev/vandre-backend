import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly logger = new Logger(CacheService.name);

  /**
   * Obtém um valor do cache
   * @param key Chave do cache
   * @returns Valor armazenado ou undefined se não existir ou estiver expirado
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    // Verificar se o item expirou
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.data as T;
  }

  /**
   * Armazena um valor no cache
   * @param key Chave do cache
   * @param value Valor a ser armazenado
   * @param ttlMs Tempo de vida em milissegundos (padrão: 5 minutos)
   */
  set(key: string, value: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data: value,
      expiry: Date.now() + ttlMs
    });
  }

  /**
   * Remove um item do cache
   * @param key Chave do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtém do cache ou executa a função fornecida e armazena o resultado
   * @param key Chave do cache
   * @param fn Função que retorna o valor a ser armazenado se não estiver em cache
   * @param ttlMs Tempo de vida em milissegundos (padrão: 5 minutos)
   * @returns Valor do cache ou resultado da função
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttlMs: number = 5 * 60 * 1000): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      this.logger.debug(`Cache hit para chave: ${key}`);
      return cached;
    }
    
    this.logger.debug(`Cache miss para chave: ${key}`);
    
    try {
      const result = await fn();
      this.set(key, result, ttlMs);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao executar função para a chave ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifica se uma chave existe no cache e não está expirada
   * @param key Chave do cache
   * @returns true se a chave existir e não estiver expirada
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }
    
    // Verificar se o item expirou
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Atualiza o tempo de expiração de um item do cache
   * @param key Chave do cache
   * @param ttlMs Novo tempo de vida em milissegundos
   * @returns true se o item foi atualizado, false se não existir
   */
  updateExpiry(key: string, ttlMs: number = 5 * 60 * 1000): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }
    
    item.expiry = Date.now() + ttlMs;
    return true;
  }

  /**
   * Remove do cache todas as chaves que começam com o prefixo fornecido
   * @param prefix Prefixo para filtrar as chaves
   * @returns Número de chaves removidas
   */
  deleteByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    this.logger.debug(`Removidas ${count} chaves com prefixo: ${prefix}`);
    return count;
  }

  /**
   * Obtém todas as chaves do cache que não estão expiradas
   * @returns Array de chaves
   */
  getKeys(): string[] {
    const now = Date.now();
    const keys: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry >= now) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  /**
   * Obtém o tamanho atual do cache (número de itens)
   * @param countOnlyValid Se true, conta apenas itens não expirados
   * @returns Número de itens no cache
   */
  size(countOnlyValid: boolean = true): number {
    if (!countOnlyValid) {
      return this.cache.size;
    }
    
    const now = Date.now();
    let count = 0;
    
    for (const item of this.cache.values()) {
      if (item.expiry >= now) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Executa uma função para cada item válido no cache
   * @param callback Função a ser executada para cada item
   */
  forEach(callback: (value: any, key: string) => void): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry >= now) {
        callback(item.data, key);
      }
    }
  }

  /**
   * Remove todos os itens expirados do cache
   * @returns Número de itens removidos
   */
  purgeExpired(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.logger.debug(`Removidos ${count} itens expirados do cache`);
    }
    
    return count;
  }

  /**
   * Cria um namespace para o cache, facilitando a organização e invalidação
   * @param namespace Nome do namespace
   * @returns Objeto com métodos para operar no namespace
   */
  namespace(namespace: string) {
    const prefix = `${namespace}:`;
    
    return {
      get: <T>(key: string): T | undefined => {
        return this.get<T>(`${prefix}${key}`);
      },
      
      set: (key: string, value: any, ttlMs?: number): void => {
        this.set(`${prefix}${key}`, value, ttlMs);
      },
      
      delete: (key: string): void => {
        this.delete(`${prefix}${key}`);
      },
      
      clear: (): number => {
        return this.deleteByPrefix(prefix);
      },
      
      getOrSet: <T>(key: string, fn: () => Promise<T>, ttlMs?: number): Promise<T> => {
        return this.getOrSet<T>(`${prefix}${key}`, fn, ttlMs);
      },
      
      has: (key: string): boolean => {
        return this.has(`${prefix}${key}`);
      }
    };
  }
}