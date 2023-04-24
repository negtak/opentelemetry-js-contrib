import { InstrumentationBase } from "@opentelemetry/instrumentation"
// import * as semanticConventions from '@opentelemetry/semantic-conventions';
import * as api from '@opentelemetry/api';
import { HlsJsInstrumentationConfig } from './types';
import { VERSION } from './version';
import Hls from "hls.js";

export class HlsJsInstrumentation extends InstrumentationBase {
  static readonly SERVICE = 'hlsjs';
  constructor(_config?: HlsJsInstrumentationConfig) {
    super('@opentelemetry/instrumentation-hlsjs', VERSION, _config);
  }
  protected init() {}

  _patchAttachMedia() {
    const tracer = this.tracer;
    console.log("patching hlsjs.attachMedia ...");
    return (original: any) => {
      return function patchAttachMedia(this: Hls, ...args: any[]) {
        const span = tracer.startSpan('hlsjs.attachMedia', {
          kind: api.SpanKind.CLIENT,
          attributes: {
            ['test']: 'test2',
          },
        },
        api.ROOT_CONTEXT
        );
        api.context.with(
          api.trace.setSpan(api.context.active(), span),
          () => {
            const result = original.apply(this, args);
            span.end();
            return result;
          },
        );
      };
    };
  }

  _patchStopLoad() {
    const tracer = this.tracer;
    return function stopLoad(original: any) {
      return function patchStopLoad(this: Hls) {
        const span = tracer.startSpan('hlsjs.stopLoad');
        api.context.with(
          api.trace.setSpan(api.context.active(), span),
          () => {
            const result = original.apply(this);
            span.end();
            return result;
          },
        );
      };
    };
  }

  override enable() {
    this._wrap(Hls.prototype, 'attachMedia', this._patchAttachMedia());
    this._wrap(Hls.prototype, 'stopLoad', this._patchStopLoad());
  }

  override disable() {
    this._unwrap(Hls.prototype, 'attachMedia');
  }
}
