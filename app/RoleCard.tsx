"use client";

import QRCode from "react-qr-code";

type Props = {
  name: string;
  mainRole: string;
  subRole: string;
  age?: number;
  affiliation?: string;
  outfit?: string;
  item?: string;
};

export default function RoleCard({
  name,
  mainRole,
  subRole,
  age,
  affiliation,
  outfit,
  item,
}: Props) {

  const url =
    typeof window !== "undefined"
      ? window.location.href
      : "https://role-city.vercel.app";

  return (
    <div className="w-full flex justify-center">

      <div
        className="
        w-full
        max-w-[820px]
        bg-white
        rounded-3xl
        shadow-xl
        overflow-hidden
        "
      >

        {/* 上部ヘッダー */}
        <div
          className="
          bg-gradient-to-r
          from-yellow-400
          to-orange-400
          p-8
          text-white
          "
        >

          <div className="text-sm tracking-widest opacity-80">
            ROLE CITY CARD
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">

            <div className="bg-white/20 p-4 rounded-xl">
              <div className="text-xs opacity-80">MAIN ROLE</div>
              <div className="text-xl font-bold">{mainRole}</div>
            </div>

            <div className="bg-white/20 p-4 rounded-xl">
              <div className="text-xs opacity-80">SUB ROLE</div>
              <div className="text-xl font-bold">{subRole}</div>
            </div>

          </div>
        </div>


        {/* メイン部分 */}
        <div className="p-8 grid md:grid-cols-2 gap-8">

          {/* 左情報 */}
          <div>

            <div className="text-xs text-gray-400">
              NAME ON CARD
            </div>

            <div className="text-2xl font-bold mb-6">
              {name}
            </div>

            <div className="grid grid-cols-2 gap-4">

              {age && (
                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="text-xs text-gray-400">AGE</div>
                  <div className="font-bold">{age}</div>
                </div>
              )}

              {affiliation && (
                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="text-xs text-gray-400">
                    AFFILIATION
                  </div>
                  <div className="font-bold">{affiliation}</div>
                </div>
              )}

              {outfit && (
                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="text-xs text-gray-400">OUTFIT</div>
                  <div className="font-bold">{outfit}</div>
                </div>
              )}

              {item && (
                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="text-xs text-gray-400">ITEM</div>
                  <div className="font-bold">{item}</div>
                </div>
              )}

            </div>

          </div>


          {/* 右側（アバター＋QR） */}
          <div className="flex flex-col items-center gap-6">

            {/* アバター */}
            <div
              className="
              w-[160px]
              h-[220px]
              bg-gray-100
              rounded-2xl
              flex
              items-center
              justify-center
              "
            >
              <span className="text-gray-400">
                Avatar
              </span>
            </div>


            {/* QR */}
            <div className="text-center">

              <div className="text-xs text-gray-400 mb-2">
                SHARE
              </div>

              <div className="bg-white p-3 rounded-xl shadow">

                <QRCode
                  value={url}
                  size={110}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}