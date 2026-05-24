import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

  try {

    const expiredReservations =
      await prisma.reservation.findMany({

        where: {
          status: "PENDING",

          expiresAt: {
            lt: new Date(),
          },
        },
      });

    for (const reservation of expiredReservations) {

      await prisma.$transaction(
        async (tx) => {

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
            },
          });

          await tx.reservation.update({

            where: {
              id: reservation.id,
            },

            data: {
              status: "EXPIRED",
            },
          });
        }
      );
    }

    return NextResponse.json({
      success: true,
      expiredCount:
        expiredReservations.length,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Cron job failed",
      },
      {
        status: 500,
      }
    );
  }
}