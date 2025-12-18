import { registerAs } from '@nestjs/config';
import { RuntimeConfigStore } from './runtime-config.store';

export default registerAs('runtime', () => ({
  ...RuntimeConfigStore,
}));
