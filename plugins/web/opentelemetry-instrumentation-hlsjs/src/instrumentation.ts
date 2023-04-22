import { InstrumentationBase } from "@opentelemetry/instrumentation"
import { HlsJsInstrumentationConfig } from './types';
import { VERSION } from './version';
import Hls from "hls.js";

export class HlsJsInstrumentation extends InstrumentationBase {
  static readonly SERVICE = 'hlsjs';
  constructor(_config?: HlsJsInstrumentationConfig) {
    super('@opentelemetry/instrumentation-hlsjs', VERSION, _config);
  }
  protected init() {}

  private _patchAttachMedia() {
    const tracer = this.tracer;
    return (original: any) => {
      return function patchAttachMedia(this: Hls, ...args: any[]) {
        const span = tracer.startSpan('hlsjs.attachMedia');
        const result = original.apply(this, args);
        span.end();
        return result;
      };
    };
  }

  private _patchStopLoad() {
    const tracer = this.tracer;
    return (original: any) => {
      return function patchStopLoad(this: Hls, ...args: any[]) {
        const span = tracer.startSpan('hlsjs.stopLoad');
        const result = original.apply(this, args);
        span.end();
        return result;
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
