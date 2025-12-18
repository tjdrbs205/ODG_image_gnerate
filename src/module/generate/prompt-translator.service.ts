import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as deepl from 'deepl-node';

@Injectable()
export class PromptTranslatorService {
  private readonly logger = new Logger(PromptTranslatorService.name);
  private readonly translator: deepl.DeepLClient;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('runtime.DEEPL_API_KEY');
    if (!apiKey) throw new Error('Missing runtime.DEEPL_API_KEY');

    const isFreePlanKey = apiKey.endsWith(':fx');
    this.translator = new deepl.DeepLClient(
      apiKey,
      isFreePlanKey ? { serverUrl: 'https://api-free.deepl.com' } : undefined,
    );
  }

  async toEnglishPrompt(koreanText: string): Promise<string> {
    try {
      const text = koreanText?.trim();
      if (!text) return koreanText;

      const result = await this.translator.translateText(text, 'ko', 'en-US');
      return result.text || koreanText;
    } catch (error) {
      this.logger.warn(
        'Prompt translation failed; falling back to original text.',
        error as Error,
      );
      return koreanText;
    }
  }
}
