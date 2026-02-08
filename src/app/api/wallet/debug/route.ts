import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const envs = [
        "APPLE_TEAM_ID",
        "APPLE_PASS_TYPE_ID",
        "APPLE_SIGNER_KEY_PASSWORD",
        "APPLE_PASS_KEY_PASSWORD",
        "APPLE_SIGNER_CERT",
        "APPLE_SIGNER_KEY",
        "APPLE_WWDR_CERT"
    ];

    const results = envs.map(key => {
        const val = process.env[key];
        return {
            key,
            exists: !!val,
            length: val ? val.length : 0,
            has_newline: val ? (val.includes('\n') || val.includes('\r')) : false,
            // Only show last 4 chars if it's not a cert/key to avoid leaking sensitive info
            preview: (val && key.indexOf('CERT') === -1 && key.indexOf('KEY') === -1)
                ? `${val.substring(0, 3)}...${val.slice(-3)}`
                : "redacted"
        };
    });

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
        variables: results
    });
}
