/**
 * This file serves as intellisense for sern projects.
 * Types are declared here for dependencies to function properly
 * Service(s) api rely on this file to provide a better developer experience.
 */

import {  CoreDependencies} from '@sern/handler'
import { Client } from 'discord.js'
import { Publisher } from '@sern/publisher';

declare global {
   interface Dependencies extends CoreDependencies {
        '@sern/client': Client;
        'publisher': Publisher;
   }
}

export {}
