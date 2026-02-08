import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Apple Wallet Web Service: Registration
 * POST /v1/devices/{deviceId}/registrations/{passTypeId}/{serialNumber}
 * DELETE /v1/devices/{deviceId}/registrations/{passTypeId}/{serialNumber}
 */

interface Params {
    deviceId: string;
    passTypeId: string;
    serialNumber: string;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { deviceId, passTypeId, serialNumber } = await params;
        const body = await req.json();
        const { pushToken } = body;

        // Verify Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("ApplePass ")) {
            return new NextResponse(null, { status: 401 });
        }
        const authToken = authHeader.replace("ApplePass ", "");

        const supabase = createAdminClient();

        // 1. Verify the pass exists and the authToken is correct
        const { data: coupon, error: couponError } = await supabase
            .from("coupons")
            .select("id, authentication_token")
            .eq("code", serialNumber) // Serial number is the coupon code
            .single();

        if (couponError || !coupon) {
            return new NextResponse(null, { status: 404 });
        }

        if (coupon.authentication_token !== authToken) {
            return new NextResponse(null, { status: 401 });
        }

        // 2. Register the device
        // We'll need a registration table for this
        const { error: regError } = await supabase
            .from("wallet_registrations")
            .upsert({
                device_id: deviceId,
                push_token: pushToken,
                pass_type_id: passTypeId,
                serial_number: serialNumber,
                coupon_id: coupon.id
            }, {
                onConflict: "device_id, pass_type_id, serial_number"
            });

        if (regError) {
            console.error("Registration error:", regError);
            return new NextResponse(null, { status: 500 });
        }

        return new NextResponse(null, { status: 201 });

    } catch (error) {
        console.error("WWS Registration Error:", error);
        return new NextResponse(null, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { deviceId, passTypeId, serialNumber } = await params;

        // Verify Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("ApplePass ")) {
            return new NextResponse(null, { status: 401 });
        }
        const authToken = authHeader.replace("ApplePass ", "");

        const supabase = createAdminClient();

        // 1. Verify the pass exists and the authToken belongs to it
        const { data: coupon, error: couponError } = await supabase
            .from("coupons")
            .select("id, authentication_token")
            .eq("code", serialNumber)
            .single();

        if (couponError || !coupon) {
            return new NextResponse(null, { status: 404 });
        }

        if (coupon.authentication_token !== authToken) {
            return new NextResponse(null, { status: 401 });
        }

        // 2. Unregister the device
        const { error: unregError } = await supabase
            .from("wallet_registrations")
            .delete()
            .match({
                device_id: deviceId,
                pass_type_id: passTypeId,
                serial_number: serialNumber
            });

        if (unregError) {
            console.error("Unregistration error:", unregError);
            return new NextResponse(null, { status: 500 });
        }

        return new NextResponse(null, { status: 200 });

    } catch (error) {
        console.error("WWS Unregistration Error:", error);
        return new NextResponse(null, { status: 500 });
    }
}
