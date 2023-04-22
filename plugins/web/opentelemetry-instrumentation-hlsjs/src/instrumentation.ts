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
    return function patchAttachMedia(this: Hls, original: Function) {
      const span = tracer.startSpan('hlsjs.attachMedia');
      const result = original.apply(this, arguments);
      console.log("===test===");
      span.end();
      return result;
    }
  }
  override enable() {
    this._wrap(Hls.prototype, 'attachMedia', this._patchAttachMedia());
  }

  override disable() {
    this._unwrap(Hls.prototype, 'attachMedia');
  }
}
