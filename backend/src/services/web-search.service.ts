// backend/src/services/web-search.service.ts
//
// FREE Web Search Service
// Uses DuckDuckGo (no API key needed) or Google Custom Search (free tier)
//

import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export class WebSearchService {
  private searchProvider: 'duckduckgo' | 'google' | 'brave';
  private googleApiKey?: string;
  private googleSearchEngineId?: string;
  private braveApiKey?: string;

  constructor() {
    // Determine which search provider to use based on available credentials
    if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      this.searchProvider = 'google';
      this.googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
      this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
      console.log('[SEARCH] Using Google Custom Search');
    } else if (process.env.BRAVE_SEARCH_API_KEY) {
      this.searchProvider = 'brave';
      this.braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
      console.log('[SEARCH] Using Brave Search');
    } else {
      this.searchProvider = 'duckduckgo';
      console.log('[SEARCH] Using DuckDuckGo (free, no API key)');
    }
  }

  /**
   * Search the web for a query
   * Returns top results with URLs
   */
  async search(query: string, numResults: number = 5): Promise<SearchResult[]> {
    try {
      switch (this.searchProvider) {
        case 'google':
          return await this.searchGoogle(query, numResults);
        case 'brave':
          return await this.searchBrave(query, numResults);
        case 'duckduckgo':
        default:
          return await this.searchDuckDuckGo(query, numResults);
      }
    } catch (error) {
      console.error(`[SEARCH] Error with ${this.searchProvider}:`, error);
      // Fallback to DuckDuckGo if primary fails
      if (this.searchProvider !== 'duckduckgo') {
        console.log('[SEARCH] Falling back to DuckDuckGo');
        return await this.searchDuckDuckGo(query, numResults);
      }
      return [];
    }
  }

  /**
   * Search multiple queries and combine results
   */
  async searchMultiple(queries: string[], numResultsEach: number = 3): Promise<Map<string, SearchResult[]>> {
    const results = new Map<string, SearchResult[]>();

    for (const query of queries) {
      const searchResults = await this.search(query, numResultsEach);
      results.set(query, searchResults);

      // Small delay to avoid rate limiting
      await this.delay(200);
    }

    return results;
  }

  // ===========================================================================
  // DUCKDUCKGO (FREE - No API Key)
  // ===========================================================================

  private async searchDuckDuckGo(query: string, numResults: number): Promise<SearchResult[]> {
    try {
      // DuckDuckGo HTML search (no official API, but this works)
      const response = await axios.get('https://html.duckduckgo.com/html/', {
        params: {
          q: query,
          kl: 'us-en'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const results: SearchResult[] = [];
      const html = response.data;

      // Parse results from HTML (simple regex extraction)
      // DuckDuckGo returns results in <a class="result__a"> tags
      const resultRegex = /<a class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([^<]*)<\/a>/g;

      let match;
      while ((match = resultRegex.exec(html)) !== null && results.length < numResults) {
        const url = this.decodeUrl(match[1]);
        if (url && !url.includes('duckduckgo.com')) {
          results.push({
            url: url,
            title: this.decodeHtml(match[2]),
            snippet: this.decodeHtml(match[3])
          });
        }
      }

      // Alternative parsing if above doesn't work
      if (results.length === 0) {
        const altRegex = /href="\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)[^"]*"[^>]*class="result__a"[^>]*>([^<]+)/g;
        while ((match = altRegex.exec(html)) !== null && results.length < numResults) {
          const url = decodeURIComponent(match[1]);
          results.push({
            url: url,
            title: this.decodeHtml(match[2]),
            snippet: ''
          });
        }
      }

      return results;

    } catch (error) {
      console.error('[DUCKDUCKGO] Search failed:', error);
      return [];
    }
  }

  // ===========================================================================
  // GOOGLE CUSTOM SEARCH (FREE TIER - 100/day)
  // ===========================================================================

  private async searchGoogle(query: string, numResults: number): Promise<SearchResult[]> {
    if (!this.googleApiKey || !this.googleSearchEngineId) {
      console.error('[GOOGLE] Missing API key or Search Engine ID');
      return this.searchDuckDuckGo(query, numResults);
    }

    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.googleApiKey,
          cx: this.googleSearchEngineId,
          q: query,
          num: Math.min(numResults, 10)
        },
        timeout: 10000
      });

      const items = response.data.items || [];
      return items.map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet || ''
      }));

    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error('[GOOGLE] Rate limit exceeded, falling back to DuckDuckGo');
        return this.searchDuckDuckGo(query, numResults);
      }
      console.error('[GOOGLE] Search failed:', error);
      return [];
    }
  }

  // ===========================================================================
  // BRAVE SEARCH (FREE TIER - 2000/month)
  // ===========================================================================

  private async searchBrave(query: string, numResults: number): Promise<SearchResult[]> {
    if (!this.braveApiKey) {
      console.error('[BRAVE] Missing API key');
      return this.searchDuckDuckGo(query, numResults);
    }

    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        params: {
          q: query,
          count: Math.min(numResults, 20)
        },
        headers: {
          'X-Subscription-Token': this.braveApiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      const results = response.data.web?.results || [];
      return results.map((item: any) => ({
        title: item.title,
        url: item.url,
        snippet: item.description || ''
      }));

    } catch (error: any) {
      console.error('[BRAVE] Search failed:', error);
      return this.searchDuckDuckGo(query, numResults);
    }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private decodeUrl(encodedUrl: string): string {
    try {
      // DuckDuckGo encodes URLs in their redirect
      if (encodedUrl.includes('uddg=')) {
        const match = encodedUrl.match(/uddg=([^&]+)/);
        if (match) {
          return decodeURIComponent(match[1]);
        }
      }
      return encodedUrl;
    } catch {
      return encodedUrl;
    }
  }

  private decodeHtml(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Search specifically for university information
   */
  async searchUniversityInfo(
    universityName: string,
    programName: string,
    infoType: 'tuition' | 'requirements' | 'deadlines' | 'scholarships'
  ): Promise<SearchResult[]> {
    const queries: Record<string, string> = {
      tuition: `${universityName} ${programName} international tuition fees 2025`,
      requirements: `${universityName} ${programName} admission requirements international students`,
      deadlines: `${universityName} ${programName} application deadline 2025`,
      scholarships: `${universityName} international student scholarships`
    };

    const query = queries[infoType];
    return this.search(query, 3);
  }
}

// Export singleton
export const webSearchService = new WebSearchService();
