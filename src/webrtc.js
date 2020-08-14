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
 * 录音相关api
 */

"use strict";

/**
 * 音频流相关
 */
class MediaStream {
  constructor(stream) {
    if (!stream) throw new Error("请通过MediaStream.getStream()来初始化");
    this.stream = stream;
    this.leftDataList = []; // 左声道数据
    this.rightDataList = []; // 右声道数据
    // (this.mediaNode = ""), (this.jsNode = "");
  }

  /**
   * 向用户申请音频访问权限，初始化音频流
   * @returns {object} 返回MediaStream对象
   */
  static async getStream() {
    try {
      if (!this.stream) {
        const stream = await window.navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.stream = new MediaStream(stream);
      }
      return this.stream;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * 开始录音
   */
  startRecording() {
    try {
      if (!this.stream) throw new Error("请先初始化音频流");
      this.resetStream();
      let audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      let mediaNode = audioContext.createMediaStreamSource(this.stream);
      // 创建一个jsNode
      let jsNode = this.createJSNode(audioContext);
      // 需要连到扬声器消费掉outputBuffer，process回调才能触发
      // 并且由于不给outputBuffer设置内容，所以扬声器不会播放出声音
      jsNode.connect(audioContext.destination);
      jsNode.onaudioprocess = this.onAudioProcess;
      // 把mediaNode连接到jsNode
      mediaNode.connect(jsNode);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * 创建javascriptProcessorNode实例
   * @param {*} audioContext
   */
  createJSNode(audioContext) {
    const BUFFER_SIZE = 4096; // 缓冲区大小
    const INPUT_CHANNEL_COUNT = 2; // 输入频道数量
    const OUTPUT_CHANNEL_COUNT = 2; // 输出频道数量
    // createJavaScriptNode已被废弃
    let creator =
      audioContext.createScriptProcessor || audioContext.createJavaScriptNode;
    creator = creator.bind(audioContext);
    return creator(BUFFER_SIZE, INPUT_CHANNEL_COUNT, OUTPUT_CHANNEL_COUNT);
  }

  /**
   * 录音进程回调
   * @param {*} event // AudioBuffer实例
   */
  onAudioProcess = (event) => {
    let audioBuffer = event.inputBuffer;
    let leftChannelData = audioBuffer.getChannelData(0),
      rightChannelData = audioBuffer.getChannelData(1);
    this.leftDataList.push(leftChannelData.slice());
    this.rightDataList.push(rightChannelData.slice());
  };

  mergeArray(list) {
    let length = list.length * list[0].length;
    let data = new Float32Array(length),
      offset = 0;
    for (let i = 0; i < list.length; i++) {
      data.set(list[i], offset);
      offset += list[i].length;
    }
    return data;
  }

  /**
   * 停止录音
   */
  stopRecording() {
    const mediaStream = this.stream.getAudioTracks();
    if(!mediaStream) throw new Error("未开始录音")
    mediaStream[0] && mediaStream[0].stop()
    let leftData = this.mergeArray(this.leftDataList);
    let rightData = this.mergeArray(this.rightDataList);
    let allData = this.interleaveLeftAndRight(leftData, rightData);
    let wavBuffer = this.createWavFile(allData);
    let blob = new Blob([new Uint8Array(wavBuffer)]);
    return blob
  }

  resetStream(){
    this.leftDataList = []; // 左声道数据
    this.rightDataList = []; // 右声道数据
  }

  // 交叉合并左右声道的数据
  interleaveLeftAndRight(left, right) {
    let totalLength = left.length + right.length;
    let data = new Float32Array(totalLength);
    for (let i = 0; i < left.length; i++) {
      let k = i * 2;
      data[k] = left[i];
      data[k + 1] = right[i];
    }
    return data;
  }


  writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  createWavFile(audioData) {
    const WAV_HEAD_SIZE = 44;
    let buffer = new ArrayBuffer(audioData.length * 2 + WAV_HEAD_SIZE),
      // 需要用一个view来操控buffer
      view = new DataView(buffer);
    // 写入wav头部信息
    // RIFF chunk descriptor/identifier
    this.writeUTFBytes(view, 0, "RIFF");
    // RIFF chunk length
    view.setUint32(4, 44 + audioData.length * 2, true);
    // RIFF type
    this.writeUTFBytes(view, 8, "WAVE");
    // format chunk identifier
    // FMT sub-chunk
    this.writeUTFBytes(view, 12, "fmt ");
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    // sample rate
    view.setUint32(24, 44100, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, 44100 * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2 * 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data sub-chunk
    // data chunk identifier
    this.writeUTFBytes(view, 36, "data");
    // data chunk length
    view.setUint32(40, audioData.length * 2, true);
    // 写入PCM数据
    let length = audioData.length;
    let index = 44;
    let volume = 1;
    for (let i = 0; i < length; i++) {
      view.setInt16(index, audioData[i] * (0x7fff * volume), true);
      index += 2;
    }
    return buffer;
  }
}

export { MediaStream };
