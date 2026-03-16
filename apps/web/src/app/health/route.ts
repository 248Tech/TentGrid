import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "eventgrid-web",
    version: "0.0.1",
  });
}
