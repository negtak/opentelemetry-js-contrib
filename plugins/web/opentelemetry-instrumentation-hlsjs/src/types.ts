import { InstrumentationConfig } from '@opentelemetry/instrumentation';

export type EventName = keyof HTMLElementEventMap;

export interface HlsJsInstrumentationConfig extends InstrumentationConfig {
  eventNames?: EventName[];
}
