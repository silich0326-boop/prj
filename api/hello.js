import {agentConfiguration} from './agent.js'
// 동작 확인용 서버 함수 → http://localhost:3000/api/hello
// 키 값은 절대 내보내지 않고 "있는지 없는지"만 알려줍니다.
export default function handler(req, res) {
  const config=agentConfiguration()
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    aiProvider:config.provider,
    aiModel:config.model,
    hasAiKey:config.ready,
    hasOpenAiKey:Boolean(process.env.OPENAI_API_KEY),
    hasDataKey: Boolean(process.env.DATA_GO_KR_KEY),
    hasClaudeKey: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
