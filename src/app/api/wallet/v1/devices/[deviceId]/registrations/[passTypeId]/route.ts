import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Apple Wallet Web Service: Serial Numbers
 * GET /v1/devices/{deviceId}/registrations/{passTypeId}?passesUpdatedSince={tag}
 * 
 * Apple calls this after receiving a push signal to ask:
 * "Which passes for this device need to be updated?"
 * We always return all serial numbers for the device, so Apple always
 * fetches the latest pass (which may contain a new wallet_message).
 */

interface Params {
    deviceId: string;
    passTypeId: string;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { deviceId, passTypeId } = await params;

        const supabase = createAdminClient();

        // Return ALL serial numbers for this device + pass type.
        // We do NOT filter by updated_at (that column doesn't exist in our schema).
        // Always returning all serials ensures Apple always re-fetches the latest pass,
        // which is how we deliver wallet_message updates and changeMessage notifications.
        const { data, error } = await supabase
            .from("wallet_registrations")
            .select("serial_number")
            .eq("device_id", deviceId)
            .eq("pass_type_id", passTypeId);

        if (error) {
            console.error("WWS Serial Numbers Error:", error);
            return new NextResponse(null, { status: 500 });
        }

        if (!data || data.length === 0) {
            return new NextResponse(null, { status: 204 });
        }

        const serialNumbers = data.map(reg => reg.serial_number);

        return NextResponse.json({
            lastUpdated: new Date().toISOString(), // current time as the new tag
            serialNumbers,
        });

    } catch (error) {
        console.error("WWS Serial Numbers Error:", error);
        return new NextResponse(null, { status: 500 });
    }
}
