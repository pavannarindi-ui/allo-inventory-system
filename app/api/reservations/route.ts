export const dynamic = "force-dynamic";
import { NextRequest, NextResponse }
from "next/server";

import { createReservation }
from "@/lib/reservation";

export async function POST(
  req: NextRequest
) {

  try {

    const body = await req.json();

    const reservation =
      await createReservation(
        body.productId,
        body.warehouseId,
        body.quantity
      );

    return NextResponse.json(
      reservation
    );

  } catch (error: any) {

    if (
      error.message ===
      "INSUFFICIENT_STOCK"
    ) {

      return NextResponse.json(
        {
          error:
            "Not enough stock available",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}