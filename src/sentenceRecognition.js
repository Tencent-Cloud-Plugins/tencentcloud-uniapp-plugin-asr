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

import apis from "./api";

/**
 * 一句话识别api
 * @param {object} params
 * @param {string} params.engSerViceType 引擎模型类型。 8k_zh：电话 8k 中文普通话通用；16k_zh：16k 中文普通话通用；16k_en：16k 英语；16k_ca：16k 粤语。
 * @param {integer} params.sourceType 语音数据来源。0：语音URL；1：语音数据（post body）。
 * @param {string} params.voiceFormat 识别音频的音频格式。mp3、wav。
 * @param {string} params.usrAudioKey 用户端对此任务的唯一标识，用户自助生成，用于用户查找识别结果。
 * @param {string} [params.url] 语音 URL，公网可下载。当 SourceType 值为 0（语音 URL上传） 时须填写该字段，为 1 时不填；URL 的长度大于 0，小于 2048，需进行urlencode编码。音频时间长度要小于60s。
 * @param {string} [params.data] 	语音数据，当SourceType 值为1（本地语音数据上传）时必须填写，当SourceType 值为0（语音 URL上传）可不写。要使用base64编码(采用python语言时注意读取文件应该为string而不是byte，以byte格式读取后要decode()。编码后的数据不可带有回车换行符)。音频数据要小于600KB。
 * @param {integer} [params.dataLen] 数据长度，单位为字节。当 SourceType 值为1（本地语音数据上传）时必须填写，当 SourceType 值为0（语音 URL上传）可不写（此数据长度为数据未进行base64编码时的数据长度）。
 * @param {string} [params.hotwordId] 	热词id。用于调用对应的热词表，如果在调用语音识别服务时，不进行单独的热词id设置，自动生效默认热词；如果进行了单独的热词id设置，那么将生效单独设置的热词id
 * @param {integer} [params.filterDirty] 	是否过滤脏词（目前支持中文普通话引擎）。0：不过滤脏词；1：过滤脏词；2：将脏词替换为 *
 * @param {integer} [params.filterModal] 是否过语气词（目前支持中文普通话引擎）。0：不过滤语气词；1：部分过滤；2：严格过滤 。
 * @param {integer} [params.filterPunc] 是否过滤句末的句号（目前支持中文普通话引擎）。0：不过滤句末的句号；1：过滤句末的句号。
 * @param {integer} [params.convertNumMode] 是否进行阿拉伯数字智能转换。0：不转换，直接输出中文数字，1：根据场景智能转换为阿拉伯数字。默认值为1
 * @return {Promise<object>} result 音频识别结果
 */
export async function sentenceRecognition(params) {
  if (!params.engSerViceType || params.sourceType===undefined || !params.voiceFormat || !params.usrAudioKey || (!params.data && !params.url)) {
    throw new Error("缺少必要参数");
  }
  return apis.sentenceRecognition({
    ...params,
    ProjectId: 0, // 默认参数
    SubServiceType: 2, // 默认参数
  });
}


