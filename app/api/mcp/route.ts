import { NextRequest, NextResponse } from "next/server";
import { getToolByName, toolsAsMcpFormat } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";

// A minimal, spec-shaped MCP (Model Context Protocol) server over
// JSON-RPC 2.0 / HTTP. It implements the three methods any MCP client
// needs to discover and call tools against this CRM:
//   - initialize
//   - tools/list
//   - tools/call
//
// This is the same tool surface used by the in-app agent chat
// (app/api/agent/chat/route.ts), so this endpoint is a real,
// independently-connectable MCP server for this CRM - point Claude
// Desktop, Claude Code, or any other MCP client at POST /api/mcp.

const SERVER_INFO = {
  name: "mediacorp-crm-mcp",
  version: "0.1.0",
};

function rpcResult(id: any, result: any) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: any, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    server: SERVER_INFO,
    protocol: "mcp-jsonrpc-http",
    methods: ["initialize", "tools/list", "tools/call"],
    tools: toolsAsMcpFormat().map((t) => t.name),
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id, method, params } = body || {};

  try {
    switch (method) {
      case "initialize": {
        return rpcResult(id, {
          protocolVersion: "2024-11-05",
          serverInfo: SERVER_INFO,
          capabilities: { tools: {} },
        });
      }
      case "tools/list": {
        return rpcResult(id, { tools: toolsAsMcpFormat() });
      }
      case "tools/call": {
        const toolName = params?.name;
        const args = params?.arguments || {};
        const tool = getToolByName(toolName);
        if (!tool) return rpcError(id, -32601, `Unknown tool: ${toolName}`);
        const result = await tool.execute(args);
        return rpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        });
      }
      case "notifications/initialized": {
        return NextResponse.json({ jsonrpc: "2.0", id: null, result: {} });
      }
      default:
        return rpcError(id, -32601, `Method not found: ${method}`);
    }
  } catch (err: any) {
    return rpcError(id, -32000, err?.message || "Internal error");
  }
}
