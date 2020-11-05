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

/**
 * 实时语音识别
 * @param {object} data // base64编码的voice文件
 * @param {object} params // 参数
 * @param {string} params.engine_model_type 引擎模型类型。8k_zh：电话 8k 中文普通话通用；8k_zh_finance：电话 8k 金融领域模型；16k_zh：16k 中文普通话通用；16k_en：16k 英语；16k_ca：16k 粤语；16k_ko：16k 韩语；16k_zh-TW：16k 中文普通话繁体。
 * @param {integer} params.seq 语音分片的序号，序号从 0 开始，每次请求递增1， 两个seq之间间隔不能超过6秒。
 * @param {integer} params.end 是否为最后一片，最后一片语音片为 1，其余为 0。
 * @param {string} params.voice_id 16 位 String 串作为每个音频的唯一标识，用户自己生成。
 * @param {string} [params.hotword_id] 热词 id。用于调用对应的热词表，如果在调用语音识别服务时，不进行单独的热词 id 设置，自动生效默认热词；如果进行了单独的热词 id 设置，那么将生效单独设置的热词 id。
 * @param {integer} [params.result_text_format] 识别结果文本编码方式。0：UTF-8；1：GB2312；2：GBK；3：BIG5。
 * @param {integer} [params.res_type] 结果返回方式。 0：同步返回；1：尾包返回。
 * @param {integer} [params.voice_format] 语音编码方式，可选，默认值为 4。1：wav(pcm)；4：speex(sp)；6：silk；8：mp3；10：opus（opus 格式音频流封装说明）。
 * @param {integer} [params.needvad] 0：关闭 vad，1：开启 vad。如果音频流总时长超过60秒，用户需开启 vad。
 * @param {integer} [params.vad_silence_time] 语音断句检测阈值，静音时长超过该阈值会被认为断句（多用在智能客服场景，需配合 needvad=1 使用），取值范围150-2000，单位 ms，目前仅支持 8k_zh 引擎模型。
 * @param {int} [params.source] 默认值为 0。
 * @param {integer} [params.filter_dirty] 是否过滤脏词（目前支持中文普通话引擎）。默认为0。0：不过滤脏词；1：过滤脏词；2：将脏词替换为 * 。
 * @param {integer} [params.filter_modal] 是否过滤语气词（目前支持中文普通话引擎）。默认为0。0：不过滤语气词；1：部分过滤；2：严格过滤 。
 * @param {integer} [params.filter_punc] 是否过滤句末的句号（目前支持中文普通话引擎）。默认为0。0：不过滤句末的句号；1：过滤句末的句号。
 * @param {integer} [params.convert_num_mode] 	是否进行阿拉伯数字智能转换。0：全部转为中文数字；1：根据场景智能转换为阿拉伯数字。
 * @param {integer} [params.word_info] 是否显示词级别时间戳。0：不显示；1：显示。支持引擎：8k_zh, 8k_zh_finance, 16k_zh, 16k_en, 16k_ca，默认为0。
 * @return {Promise<object>} result 语音识别结果
 */

export async function realtimeVoice(data, params) {
  if (
    !params.engine_model_type ||
    params.seq === undefined ||
    params.end === undefined ||
    params.voice_id === undefined
  ) {
    throw new Error("缺少必要参数");
  }
  const result = await uniCloud.callFunction({
    name: "tencentcloud-plugin",
    data: {
      module: "ASR",
      action: "realTimeVoice",
      data: data,
      params: params,
    },
  });
  return result;
}
