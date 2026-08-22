/**
 * 文件职责：控制应用入口页壳和模拟面试主流程之间的前端切换。
 *
 * 关联文件：
 * - components/LoginEntryShell.js：登录入口页面壳，只做前端体验入口。
 * - components/InterviewSimulator.js：现有模拟面试主功能。
 * - app/page.js：首页挂载本组件。
 *
 * 说明：
 * - 这里不做真实登录、鉴权、session 或 token。
 * - 点击进入体验版后只在当前页面状态里切换到主流程。
 */
'use client';

import { useState } from 'react';
import InterviewSimulator from './InterviewSimulator';
import LoginEntryShell from './LoginEntryShell';

// 应用入口：先展示体验版入口页壳，再进入现有模拟面试页面。
export default function AppEntry() {
  const [hasEnteredExperience, setHasEnteredExperience] = useState(false);

  if (hasEnteredExperience) {
    return <InterviewSimulator />;
  }

  return <LoginEntryShell onEnterExperience={() => setHasEnteredExperience(true)} />;
}
