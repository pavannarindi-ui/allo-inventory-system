"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

type Reservation = {
  id: string;
  status: string;
  quantity: number;
  expiresAt: string;

  product: {
    name: string;
    description: string;
  };

  warehouse: {
    name: string;
    location: string;
  };
};

export default function ReservationPage() {

  const params = useParams();

  const router = useRouter();

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [timeLeft, setTimeLeft] =
    useState("");

  async function fetchReservation() {

    try {

      const response =
        await fetch(
          `/api/reservations/${params.id}`
        );

      const data =
        await response.json();

      setReservation(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {

    if (!reservation) return;

    const interval =
      setInterval(() => {

        const expiry =
          new Date(
            reservation.expiresAt
          ).getTime();

        const now =
          new Date().getTime();

        const diff =
          expiry - now;

        if (diff <= 0) {

          setTimeLeft("Expired");

          clearInterval(interval);

          return;
        }

        const minutes =
          Math.floor(
            diff / 1000 / 60
          );

        const seconds =
          Math.floor(
            (diff / 1000) % 60
          );

        setTimeLeft(
          `${minutes}:${
            seconds < 10
              ? "0"
              : ""
          }${seconds}`
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [reservation]);

  async function confirmReservation() {

    const response =
      await fetch(
        `/api/reservations/${params.id}/confirm`,
        {
          method: "POST",
        }
      );

    if (response.ok) {

      alert("Purchase confirmed");

      router.push("/");

    } else {

      alert(
        "Reservation expired"
      );
    }
  }

  async function cancelReservation() {

    await fetch(
      `/api/reservations/${params.id}/release`,
      {
        method: "POST",
      }
    );

    alert("Reservation cancelled");

    router.push("/");
  }

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        text-2xl
      ">
        Loading reservation...
      </div>
    );
  }

  if (!reservation) {

    return (

      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
      ">
        Reservation not found
      </div>
    );
  }

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      flex
      items-center
      justify-center
      p-8
    ">

      <div className="
        w-full
        max-w-2xl
        bg-zinc-900
        border
        border-white/10
        rounded-3xl
        p-10
      ">

        <div className="
          flex
          justify-between
          items-center
          mb-8
        ">

          <div>

            <h1 className="
              text-4xl
              font-bold
            ">
              Checkout Reservation
            </h1>

            <p className="
              text-gray-400
              mt-2
            ">
              Complete your purchase before expiry.
            </p>
          </div>

          <div className="
            px-4
            py-2
            rounded-full
            bg-yellow-500/20
            text-yellow-400
          ">
            {reservation.status}
          </div>
        </div>

        <div className="
          bg-black/40
          rounded-2xl
          p-6
          mb-8
        ">

          <h2 className="
            text-3xl
            font-bold
            mb-2
          ">
            {reservation.product.name}
          </h2>

          <p className="
            text-gray-400
            mb-6
          ">
            {
              reservation.product
                .description
            }
          </p>

          <div className="
            grid
            grid-cols-2
            gap-6
          ">

            <div>

              <p className="
                text-gray-500
                text-sm
              ">
                Warehouse
              </p>

              <p className="
                text-xl
                font-semibold
              ">
                {
                  reservation.warehouse
                    .name
                }
              </p>
            </div>

            <div>

              <p className="
                text-gray-500
                text-sm
              ">
                Quantity
              </p>

              <p className="
                text-xl
                font-semibold
              ">
                {
                  reservation.quantity
                }
              </p>
            </div>
          </div>
        </div>

        <div className="
          bg-red-500/10
          border
          border-red-500/20
          rounded-2xl
          p-6
          mb-8
          text-center
        ">

          <p className="
            text-gray-400
            mb-2
          ">
            Reservation expires in
          </p>

          <h2 className="
            text-6xl
            font-bold
            text-red-400
          ">
            {timeLeft}
          </h2>
        </div>

        <div className="
          flex
          gap-4
        ">

          <button
            onClick={
              confirmReservation
            }

            className="
              flex-1
              py-4
              rounded-2xl
              bg-white
              text-black
              font-semibold
            "
          >
            Confirm Purchase
          </button>

          <button
            onClick={
              cancelReservation
            }

            className="
              flex-1
              py-4
              rounded-2xl
              bg-red-500
              text-white
              font-semibold
            "
          >
            Cancel Reservation
          </button>
        </div>
      </div>
    </main>
  );
}