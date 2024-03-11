import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/fireworks.tact',
    options: {
        debug: true,
    }
};
