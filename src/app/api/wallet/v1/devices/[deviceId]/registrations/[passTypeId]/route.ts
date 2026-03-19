import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Apple Wallet Web Service: Serial Numbers
 * GET /v1/devices/{deviceId}/registrations/{passTypeId}?passesUpdatedSince={tag}
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
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get("passesUpdatedSince");

        const supabase = createAdminClient();

        // Query for updated serial numbers for this device and pass type
        let query = supabase
            .from("wallet_registrations")
            .select("serial_number, coupons(updated_at)")
            .eq("device_id", deviceId)
            .eq("pass_type_id", passTypeId);

        if (tag) {
            // tag is the last updated timestamp we sent
            query = query.gt("coupons.updated_at", tag);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            return new NextResponse(null, { status: 204 });
        }

        // Prepare the response in Apple's format
        const serialNumbers = data.map(reg => reg.serial_number);
        const lastUpdated = data.reduce((max, reg) => {
            const updatedAt = (reg.coupons as any)?.updated_at;
            return updatedAt > max ? updatedAt : max;
        }, tag || "");

        return NextResponse.json({
            lastUpdated: lastUpdated,
            serialNumbers: serialNumbers
        });

    } catch (error) {
        console.error("WWS Serial Numbers Error:", error);
        return new NextResponse(null, { status: 500 });
    }
}
