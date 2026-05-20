import axios from 'axios';
import { OpenGraphData } from '../../domain/RecursoBase';

export class OpenGraphService {
  async extractMetadata(url: string): Promise<OpenGraphData> {
    try {
      console.log(`[OpenGraphService] Extrayendo metadatos para URL: ${url}`);
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'UniConnectBot/1.0',
        },
        responseType: 'text',
      });

      const html = response.data as string;

      // Intentar extraer meta tags con expresiones regulares
      const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
      
      const descriptionMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                               html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);

      const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

      let title: string | null = titleMatch ? this._decodeHtmlEntities(titleMatch[1]) : null;
      const description: string | null = descriptionMatch ? this._decodeHtmlEntities(descriptionMatch[1]) : null;
      const image: string | null = imageMatch ? imageMatch[1] : null;

      // Fallback a etiqueta <title> si no hay og:title
      if (!title) {
        const pageTitleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (pageTitleMatch) {
          title = this._decodeHtmlEntities(pageTitleMatch[1]);
        }
      }

      return {
        title,
        description,
        image,
      };
    } catch (error: any) {
      console.warn(`[OpenGraphService] Error al extraer Open Graph para ${url}: ${error.message}`);
      return {
        title: null,
        description: null,
        image: null,
      };
    }
  }

  private _decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }
}
