export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

import {
  NextRequest,
  NextResponse,
} from "next/server";

export async function POST(
  req: NextRequest,

  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await context.params;

    await prisma.$transaction(
      async (tx) => {

        const reservation =
          await tx.reservation.findUnique({

            where: {
              id,
            },
          });

        if (!reservation) {
          throw new Error(
            "NOT_FOUND"
          );
        }

        if (
          reservation.expiresAt <
          new Date()
        ) {
          throw new Error(
            "EXPIRED"
          );
        }

        if (
          reservation.status !==
          "PENDING"
        ) {
          throw new Error(
            "INVALID_STATUS"
          );
        }

        await tx.inventory.update({

          where: {
            productId_warehouseId: {

              productId:
                reservation.productId,

              warehouseId:
                reservation.warehouseId,
            },
          },

          data: {

            reservedStock: {
              decrement:
                reservation.quantity,
            },

            totalStock: {
              decrement:
                reservation.quantity,
            },
          },
        });

        await tx.reservation.update({

          where: {
            id,
          },

          data: {
            status:
              "CONFIRMED",
          },
        });
      }
    );

    return NextResponse.json({
      success: true,
    });

  } catch (error: any) {

    if (
      error.message ===
      "EXPIRED"
    ) {

      return NextResponse.json(
        {
          error:
            "Reservation expired",
        },
        {
          status: 410,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Confirmation failed",
      },
      {
        status: 500,
      }
    );
  }
}