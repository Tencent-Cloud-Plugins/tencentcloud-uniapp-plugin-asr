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
 * 录音文件识别请求
 * @param {object} params
 * @param {string} params.engineModelType 引擎模型类型。 电话场景： • 8k_zh：电话 8k 中文普通话通用（可用于双声道音频）； • 8k_zh_s：电话 8k 中文普通话话者分离（仅适用于单声道音频）； 非电话场景： • 16k_zh：16k 中文普通话通用； • 16k_zh_video：16k 音视频领域； • 16k_en：16k 英语； • 16k_ca：16k 粤语；
 * @param {integer} params.channelNum  语音声道数。1：单声道；2：双声道（仅支持 8k_zh 引擎模型）。
 * @param {integer} params.resTextFormat  识别结果返回形式。0： 识别结果文本(含分段时间戳)； 1：仅支持16k中文引擎，含识别结果详情(词时间戳列表，一般用于生成字幕场景)。
 * @param {integer} params.sourceType 语音数据来源。0：语音URL；1：语音数据（post body）。
 * @param {string} [params.callbackUrl] 回调 URL，用户自行搭建的用于接收识别结果的服务器地址， 长度小于2048字节。如果用户使用回调方式获取识别结果，需提交该参数；如果用户使用轮询方式获取识别结果，则无需提交该参数。
 * @param {string} [params.url] 语音 URL，公网可下载。当 SourceType 值为 0（语音 URL上传） 时须填写该字段，为 1 时不填；URL 的长度大于 0，小于 2048，需进行urlencode编码。音频时间长度要小于60s。
 * @param {string} [params.data] 	语音数据，当SourceType 值为1（本地语音数据上传）时必须填写，当SourceType 值为0（语音 URL上传）可不写。要使用base64编码(采用python语言时注意读取文件应该为string而不是byte，以byte格式读取后要decode()。编码后的数据不可带有回车换行符)。音频数据要小于600KB。
 * @param {integer} [params.dataLen] 数据长度，单位为字节。当 SourceType 值为1（本地语音数据上传）时必须填写，当 SourceType 值为0（语音 URL上传）可不写（此数据长度为数据未进行base64编码时的数据长度）。
 * @param {string} [params.hotwordId] 	热词id。用于调用对应的热词表，如果在调用语音识别服务时，不进行单独的热词id设置，自动生效默认热词；如果进行了单独的热词id设置，那么将生效单独设置的热词id
 * @param {integer} [params.filterDirty] 	是否过滤脏词（目前支持中文普通话引擎）。0：不过滤脏词；1：过滤脏词；2：将脏词替换为 *
 * @param {integer} [params.filterModal] 是否过语气词（目前支持中文普通话引擎）。0：不过滤语气词；1：部分过滤；2：严格过滤 。默认值为 0。
 * @param {integer} [params.convertNumMode] 是否进行阿拉伯数字智能转换。0：不转换，直接输出中文数字，1：根据场景智能转换为阿拉伯数字。默认值为1
 * @param {string} [params.extra] 附加参数
 * @param {integer} [params.speakerDiarization] 是否开启话者分离，0：不开启，1：开启(仅支持8k_zh/16k_zh引擎模型，单声道音频)
 * @param {integer} [params.speakerNumber] 话者分离人数（需配合开启话者分离使用），支持2-10（8k_zh仅支持2， 16k_zh支持2-10）注：话者分离目前是beta版本，请根据您的需要谨慎使用
 * @return {Promise<object>} result 录音上传结果
 */
export async function createRecTask(params) {
  if (!params.engineModelType || !params.channelNum || !params.resTextFormat===undefined || params.sourceType===undefined  || (!params.data && !params.url)) {
    throw new Error("缺少必要参数");
  }
  return apis.createRecTask(params)
}

/**
 * 录音文件识别结果查询
 * @param {integer} taskId 录音上传后返回的TaskID
 * @return {Promise<object>} result 录音识别结果
 */
export async function describeTaskStatus(taskId){
  if (!taskId) {
    throw new Error("缺少taskId");
  }
  return apis.describeTaskStatus({taskId})
}
