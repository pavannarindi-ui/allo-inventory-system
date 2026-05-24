"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Inventory = {
  warehouse: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  warehouseId: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  inventories: Inventory[];
};

export default function HomePage() {

  const router = useRouter();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState({
      totalProducts: 0,
      totalAvailable: 0,
      totalReserved: 0,
      warehouses: 0,
    });

  async function fetchProducts() {

    try {

      const response =
        await fetch("/api/products");

      const data =
        await response.json();

      setProducts(data);

      let available = 0;
      let reserved = 0;

      const warehouseSet =
        new Set();

      data.forEach((p: Product) => {

        p.inventories.forEach((inv) => {

          available += inv.availableStock;
          reserved += inv.reservedStock;

          warehouseSet.add(
            inv.warehouse
          );
        });
      });

      setStats({
        totalProducts: data.length,
        totalAvailable: available,
        totalReserved: reserved,
        warehouses:
          warehouseSet.size,
      });

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {

    fetchProducts();

    const interval =
      setInterval(fetchProducts, 5000);

    return () =>
      clearInterval(interval);

  }, []);

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {

    try {

      const response =
        await fetch("/api/reservations", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId,
            warehouseId,
            quantity: 1,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {

        alert(data.error);
        return;
      }

      router.push(
        `/reservation/${data.id}`
      );

    } catch {

      alert("Reservation failed");
    }
  }

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        text-white
        text-2xl
      ">
        Loading Inventory Platform...
      </div>
    );
  }

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
    ">

      <nav className="
        border-b
        border-white/10
        bg-black/80
        backdrop-blur-xl
        sticky
        top-0
        z-50
      ">

        <div className="
          max-w-7xl
          mx-auto
          px-8
          py-5
          flex
          justify-between
          items-center
        ">

          <div>

            <h1 className="
              text-2xl
              font-bold
            ">
              Allo Inventory OS
            </h1>

            <p className="
              text-sm
              text-gray-400
            ">
              Multi-Warehouse Reservation Platform
            </p>
          </div>

          <div className="
            flex
            gap-4
          ">

            <button className="
              px-4
              py-2
              rounded-xl
              bg-white
              text-black
              font-medium
            ">
              Dashboard
            </button>

            <button className="
              px-4
              py-2
              rounded-xl
              bg-white/10
              border
              border-white/10
            ">
              Analytics
            </button>
          </div>
        </div>
      </nav>

      <div className="
        max-w-7xl
        mx-auto
        px-8
        py-10
      ">

        <div className="mb-12">

          <h2 className="
            text-5xl
            font-bold
            mb-4
          ">
            Inventory Command Center
          </h2>

          <p className="
            text-gray-400
            text-lg
            max-w-3xl
          ">
            Real-time inventory reservation
            infrastructure built for
            multi-warehouse commerce operations.
          </p>
        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
          mb-12
        ">

          <StatCard
            title="Products"
            value={stats.totalProducts}
          />

          <StatCard
            title="Available Units"
            value={stats.totalAvailable}
          />

          <StatCard
            title="Reserved Units"
            value={stats.totalReserved}
          />

          <StatCard
            title="Warehouses"
            value={stats.warehouses}
          />

        </div>

        <div className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-8
        ">

          {products.map((product) => (

            <div
              key={product.id}

              className="
                bg-gradient-to-br
                from-zinc-900
                to-zinc-950
                border
                border-white/10
                rounded-3xl
                p-8
                shadow-2xl
                hover:border-white/20
                transition
              "
            >

              <div className="
                flex
                justify-between
                items-start
                mb-8
              ">

                <div>

                  <h3 className="
                    text-3xl
                    font-bold
                    mb-2
                  ">
                    {product.name}
                  </h3>

                  <p className="
                    text-gray-400
                  ">
                    {product.description}
                  </p>
                </div>

                <div className="
                  px-4
                  py-2
                  rounded-full
                  bg-green-500/20
                  text-green-400
                  text-sm
                ">
                  Live
                </div>
              </div>

              <div className="
                space-y-6
              ">

                {product.inventories.map((inv) => {

                  const usedPercent =
                    (inv.reservedStock /
                      inv.totalStock) *
                    100;

                  return (

                    <div
                      key={inv.warehouseId}

                      className="
                        bg-black/40
                        border
                        border-white/10
                        rounded-2xl
                        p-6
                      "
                    >

                      <div className="
                        flex
                        justify-between
                        mb-5
                      ">

                        <div>

                          <h4 className="
                            text-xl
                            font-semibold
                          ">
                            {inv.warehouse}
                          </h4>

                          <p className="
                            text-gray-500
                            text-sm
                          ">
                            Fulfillment Center
                          </p>
                        </div>

                        <div className="
                          text-right
                        ">

                          <p className="
                            text-green-400
                            text-3xl
                            font-bold
                          ">
                            {inv.availableStock}
                          </p>

                          <p className="
                            text-gray-500
                            text-sm
                          ">
                            Available
                          </p>
                        </div>
                      </div>

                      <div className="
                        w-full
                        h-3
                        bg-white/10
                        rounded-full
                        overflow-hidden
                        mb-5
                      ">

                        <div
                          className="
                            h-full
                            bg-gradient-to-r
                            from-yellow-400
                            to-orange-500
                          "

                          style={{
                            width:
                              `${usedPercent}%`,
                          }}
                        />
                      </div>

                      <div className="
                        flex
                        justify-between
                        text-sm
                        text-gray-400
                        mb-6
                      ">

                        <span>
                          Reserved:
                          {" "}
                          {inv.reservedStock}
                        </span>

                        <span>
                          Total:
                          {" "}
                          {inv.totalStock}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          reserveProduct(
                            product.id,
                            inv.warehouseId
                          )
                        }

                        className="
                          w-full
                          py-4
                          rounded-2xl
                          bg-white
                          text-black
                          font-semibold
                          hover:scale-[1.02]
                          transition
                        "
                      >
                        Reserve Inventory
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (

    <div className="
      bg-zinc-900
      border
      border-white/10
      rounded-3xl
      p-6
    ">

      <p className="
        text-gray-400
        mb-2
      ">
        {title}
      </p>

      <h3 className="
        text-4xl
        font-bold
      ">
        {value}
      </h3>
    </div>
  );
}