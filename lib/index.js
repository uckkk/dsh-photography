// dsh-photography — 摄影基础：曝光三角 + 焦段 + 光线（纯 Node 知识库）。
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "摄影基础";
const inject = ["tools"];

const EXPOSURE = [
  { id: "aperture", name: "光圈", en: "Aperture", desc: "控制进光量与景深。f 值越小光圈越大、进光越多、景深越浅（背景越虚化）。", effects: ["f/1.4-2.8 浅景深人像", "f/8-11 全景清晰风光", "f/16+ 星芒效果"] },
  { id: "shutter", name: "快门", en: "Shutter Speed", desc: "控制曝光时间与运动凝固。越快越能定格动作，越慢越易拖影/光轨。", effects: ["1/500s+ 定格运动", "1/60s 手持安全快门", "数秒 长曝光光轨/星轨"] },
  { id: "iso", name: "感光度", en: "ISO", desc: "传感器对光的敏感度。越高越亮但噪点越多，尽量用低 ISO。", effects: ["ISO 100 画质最佳", "ISO 400-800 室内", "ISO 3200+ 弱光噪点明显"] },
];

const FOCAL = [
  { range: "16-24mm", type: "超广角", use: "风光、建筑、室内，夸张透视、大场景。" },
  { range: "24-35mm", type: "广角", use: "人文、环境人像、街拍，兼顾环境与主体。" },
  { range: "35-50mm", type: "标准", use: "最接近人眼视角，纪实、日常、产品。" },
  { range: "70-135mm", type: "中长焦", use: "人像特写，压缩空间、背景虚化自然。" },
  { range: "200mm+", type: "长焦", use: "远摄、体育、野生动物、月亮特写。" },
];

const LIGHT = [
  { id: "golden-hour", name: "黄金时刻", desc: "日出后/日落前一小时，光线柔和温暖、影子长，最出片。" },
  { id: "blue-hour", name: "蓝调时刻", desc: "日落后/日出前，天空幽蓝，适合城市夜景与氛围片。" },
  { id: "front", name: "顺光", desc: "光源在相机后方，主体明亮、细节清晰，但立体感弱。" },
  { id: "side", name: "侧光", desc: "光源在侧方，明暗对比强，突出质感与立体感。" },
  { id: "back", name: "逆光", desc: "光源在主体后方，营造轮廓光与氛围，需补光或剪影。" },
];

async function apply(ctx, _config) {
  ctx.tools.register(defineTool({
    name: "exposure_triangle",
    description: "返回曝光三角（光圈/快门/感光度）的说明与效果参考，帮助理解三者如何影响亮度与画面。",
    parameters: {},
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: { exposure: { type: "array", required: true, items: { type: "object", additionalProperties: false, properties: { id: { type: "string", required: true }, name: { type: "string", required: true }, en: { type: "string", required: true }, desc: { type: "string", required: true } } } } },
      },
      render: (_a, v) => [{ type: "text", text: v.exposure.map((e) => `- ${e.name}（${e.en}）：${e.desc}`).join("\n") }],
    },
    execute: async () => ({ exposure: EXPOSURE.map(({ id, name, en, desc }) => ({ id, name, en, desc })) }),
  }));

  ctx.tools.register(defineTool({
    name: "get_exposure_element",
    description: "查询曝光三角某一要素（光圈/快门/感光度）的说明与效果参考。`id` 传 aperture、shutter 或 iso。",
    parameters: { id: { type: "string", required: true, description: "曝光要素 id：aperture / shutter / iso。" } },
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: { name: { type: "string", required: true }, en: { type: "string", required: true }, desc: { type: "string", required: true }, effects: { type: "array", required: true, items: { type: "string" } } },
      },
      render: (_a, v) => [{ type: "text", text: `【${v.name}】${v.en}\n${v.desc}\n效果参考：\n${v.effects.map((e) => "  - " + e).join("\n")}` }],
    },
    execute: async (args) => {
      const e = EXPOSURE.find((x) => x.id === args.id || x.name.includes(args.id));
      if (!e) throw new Error(`未找到曝光要素：${args.id}（可用：aperture / shutter / iso）`);
      return { name: e.name, en: e.en, desc: e.desc, effects: e.effects };
    },
  }));

  ctx.tools.register(defineTool({
    name: "focal_length_guide",
    description: "返回常见焦段（超广角/广角/标准/中长焦/长焦）及其适用场景。",
    parameters: {},
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: { focal: { type: "array", required: true, items: { type: "object", additionalProperties: false, properties: { range: { type: "string", required: true }, type: { type: "string", required: true }, use: { type: "string", required: true } } } } },
      },
      render: (_a, v) => [{ type: "text", text: v.focal.map((f) => `- ${f.range}（${f.type}）：${f.use}`).join("\n") }],
    },
    execute: async () => ({ focal: FOCAL.map((f) => ({ ...f })) }),
  }));

  ctx.tools.register(defineTool({
    name: "lighting_guide",
    description: "返回自然光与光位参考（黄金时刻/蓝调时刻/顺光/侧光/逆光）。",
    parameters: {},
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: { light: { type: "array", required: true, items: { type: "object", additionalProperties: false, properties: { id: { type: "string", required: true }, name: { type: "string", required: true }, desc: { type: "string", required: true } } } } },
      },
      render: (_a, v) => [{ type: "text", text: v.light.map((l) => `- ${l.name}：${l.desc}`).join("\n") }],
    },
    execute: async () => ({ light: LIGHT.map((l) => ({ ...l })) }),
  }));
}

export { apply, inject, name };
