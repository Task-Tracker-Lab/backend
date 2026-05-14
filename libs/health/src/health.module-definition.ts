import { ConfigurableModuleBuilder } from '@nestjs/common';
import { HealthModuleOptions } from './interfaces';

export const { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<HealthModuleOptions>()
        .setClassMethodName('register')
        .setExtras(
            {
                global: false,
            },
            (definition, extras) => ({
                ...definition,
                global: extras.global,
            }),
        )
        .build();
