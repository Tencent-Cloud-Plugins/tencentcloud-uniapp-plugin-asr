/*
 * Copyright (C) 2020 Tencent Cloud.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";
// #ifdef H5
import RecorderJs from "./recorder.mp3.min";
// #endif
import { blob2Base64 } from "./blob-transfer";
// #ifdef APP-PLUS
import permision from "./permission.js"
import { filePath2Base64 } from "./util.js";
// #endif

/**
 * 录音类
 */
export default class Recorder {

  /**
   *
   * @param {fn} [callback] // 实时录音实时回调
   * @param {integer} [frameSize] // 小程序实时语音专用：语音分片大小
   */
  constructor(callback, frameSize=2) {
    this.rec = null;
    this.instance = null;
    this.callback = callback;
    this.frameSize = frameSize  // 小程序实时语音专用：语音分片大小
  }

  /**
   * 开启初始化record实例，录音授权
   */
  init = () => {
    return new Promise(async (resolve, reject) => {
      // #ifdef H5
      if (this.rec) this.rec.close();
      this.rec = RecorderJs({
        type: "mp3",
        sampleRate: 16000,
        bitRate: 16, //mp3格式，指定采样率hz、比特率kbps，其他参数使用默认配置；注意：是数字的参数必须提供数字，不要用字符串；需要使用的type类型，需提前把格式支持文件加载进来，比如使用wav格式需要提前加载wav.js编码引擎
        onProcess: (...data) => {
          // buffers,powerLevel,bufferDuration,bufferSampleRate,newBufferIdx,asyncEnd
          //录音实时回调，大约1秒调用12次本回调
          this.callback && this.callback(data, false);
        },
      });
      this.rec.open(
        function () {
          resolve();
        },
        function (msg) {
          reject(new Error("无法录音:" + msg));
        }
      );
      // #endif
      // #ifdef MP
      uni.authorize({
        scope: "scope.record",
        success: () => {
          this.rec = uni.getRecorderManager();
          if (this.callback) {
            this.rec.onFrameRecorded(({ frameBuffer, isLastFrame }) => {
              this.callback(frameBuffer, isLastFrame);
            });
          }
          resolve("获取录音权限成功");
        },
        fail: () => {
          reject(new Error("无法录音:" + msg));
        },
      });
      // #endif
      // #ifdef APP-PLUS
      if(this.callback){
        reject(new Error('App暂不支持流式上传录音'));
        return;
      }
      const status = await this.checkPermission();
      if (status !== 1) {
        reject(new Error("无法录音:没有录音权限"));
      } else {
        this.rec = uni.getRecorderManager();
        resolve("获取录音权限成功");
      }
      // #endif
    });
  };

  /**
   * 开始录音
   */
  start = async () => {
    await this.init();
    this.onStop = null;
    this.rec.start({ sampleRate: 16000, format: "mp3" });
  };

  /**
   * 异步转换结束录音
   */
  stop = async () => {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      this.rec.stop(
        async (blob, duration) => {
          this.rec.close();
          this.rec = null;
          let voiceBase64 = await blob2Base64(blob);
          voiceBase64 = (/.+;\s*base64\s*,\s*(.+)$/i.exec(voiceBase64) ||
            [])[1];
          resolve({ voiceBase64, size: blob.size });
        },
        (msg) => {
          this.rec.close();
          this.rec = null;
          reject(new Error("录音失败:" + msg));
        }
      );
      // #endif
      // #ifndef H5
      this.rec.onStop(async ({tempFilePath, fileSize, duration}) => {
        // #ifdef MP
        uni.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: "base64",
          success: ({ data }) => {
            resolve({ voiceBase64: data, size: fileSize });
          },
        });
        // #endif
        // #ifdef APP-PLUS
        let {voiceBase64, size} = await filePath2Base64(tempFilePath);
        voiceBase64 = (/.+;\s*base64\s*,\s*(.+)$/i.exec(voiceBase64) ||
          [])[1];
        resolve({ voiceBase64, size: size});
        // #endif
      });
      this.rec.stop();
      // #endif
    });
  };

  /**
   * 实时语音流开始
   */
  startRealTime = async () => {
    await this.init();
    this.rec.start({ sampleRate: 16000, format: "mp3", frameSize: 2 });
  };

  /**
   * 实时语音流结束
   */
  stopRealTime = async () => {
    // #ifdef H5
    this.rec.close();
    this.rec = null;
    // #endif
    // #ifndef H5
    this.rec.onStop(() => {});
    this.rec.stop();
    // #endif
  };

  /**
   * 判断APP端录音权限
   */
  async checkPermission() {
    let status = permision.isIOS ? await permision.requestIOS('record') :
      await permision.requestAndroid('android.permission.RECORD_AUDIO');

    if (status === null || status === 1) {
      status = 1;
    }
    return status;
  }
}
