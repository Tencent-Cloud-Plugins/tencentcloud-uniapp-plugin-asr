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

import { blob2Base64 } from "./blob-transfer";
// #ifdef H5
import RecorderJs from "./recorder.mp3.min";
// #endif

/**
 * 实时语音数据分片转码
 */
export default class RealTimeVoiceSplit {

  /**
   *
   * @param {*} [sendInterval] H5实时语音专用：语音分片间隔时间
   */
  constructor(sendInterval=1000) {
    // 上一次语音推送时间
    this.realTimeSendTryTime = 0;
    // 实时语音分片第几段
    this.realTimeSendTryNumber = 0;

    this.transferUploadNumberMax = 0;
    // 实时编码队列中排队数
    this.realTimeSendTryEncBusy = 0;
    // 语音数据缓冲块
    this.realTimeSendTryChunk = null;
    // 生成blob间隔
    this.sendInterval = sendInterval; //mp3 chunk数据会缓冲，当pcm的累积时长达到这个时长，就会传输发送。这个值在takeoffEncodeChunk实现下，使用0也不会有性能上的影响。
  }

  /**
   * H5平台发送实时切片录音
   * @param {object} rec recorder实例
   * @param {object} isClose 是否是最后一段音频
   * @returns {Promise<object>} data: 语音的Base64编码 seq: 第几个语音分片
   */
  realTimeSendTryH5 = (rec, isClose) => {
    return new Promise((resolve, reject) => {
      var t1 = Date.now();
      if (this.realTimeSendTryTime === 0) {
        this.ealTimeSendTryTime = t1;
        this.realTimeSendTryEncBusy = 0;
        this.realTimeSendTryNumber = 0;
        this.transferUploadNumberMax = 0;
        this.realTimeSendTryChunk = null;
      }
      if (!isClose && t1 - this.realTimeSendTryTime < this.sendInterval) {
        return; //控制缓冲达到指定间隔才进行传输
      }
      this.realTimeSendTryTime = t1;
      this.realTimeSendTryNumber++;

      //借用SampleData函数进行数据的连续处理，采样率转换是顺带的
      var chunk = RecorderJs.SampleData(
        rec.buffers,
        rec.srcSampleRate,
        16000,
        this.realTimeSendTryChunk,
        { frameType: isClose ? "" : "mp3" }
      );

      //清理已处理完的缓冲数据，释放内存以支持长时间录音，最后完成录音时不能调用stop，因为数据已经被清掉了
      for (
        var i = this.realTimeSendTryChunk ? this.realTimeSendTryChunk.index : 0;
        i < chunk.index;
        i++
      ) {
        rec.buffers[i] = null;
      }
      this.realTimeSendTryChunk = chunk;

      //没有新数据，或结束时的数据量太小，不能进行mock转码
      if (chunk.data.length === 0 || (isClose && chunk.data.length < 2000)) {
        return;
      }

      //实时编码队列阻塞处理
      if (!isClose) {
        if (this.realTimeSendTryEncBusy >= 2) {
          return;
        }
      }
      this.realTimeSendTryEncBusy++;

      // 通过mock方法实时转码成mp3、wav
      var encStartTime = Date.now();
      var recMock = RecorderJs({
        type: "mp3",
        sampleRate: 16000, //采样率
        bitRate: 16, //比特率
      });
      recMock.mock(chunk.data, chunk.sampleRate);
      recMock.stop(
        async (blob) => {
          this.realTimeSendTryEncBusy && this.realTimeSendTryEncBusy--;
          blob.encTime = Date.now() - encStartTime;
          let voiceData = await blob2Base64(blob);
          let base64 = (/.+;\s*base64\s*,\s*(.+)$/i.exec(voiceData) || [])[1];
          resolve({ data: base64, seq: this.realTimeSendTryNumber });
        },
        (msg) => {
          this.realTimeSendTryEncBusy && this.realTimeSendTryEncBusy--;
          reject(new Error("转码错误：" + msg));
        }
      );
    });
  };

  /**
   * 小程序发送实时切片录音
   * @param {object} buffer 音频arraybuffer
   * @return {Promise<string>} data: 语音的Base64编码 seq: 第几个语音分片
   */
  realTimeSendTryMP = async (buffer) => {
    this.realTimeSendTryNumber++;
    const base64 = uni.arrayBufferToBase64(buffer);
    return { data: base64, seq: this.realTimeSendTryNumber };
  };

}
