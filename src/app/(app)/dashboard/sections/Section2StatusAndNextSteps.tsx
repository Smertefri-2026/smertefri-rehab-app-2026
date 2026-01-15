"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/providers/RoleProvider";
import { getMyProfile } from "@/lib/profile";
import { User } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";

/* --------------------------------
   PROFILTYPE (kun felter vi faktisk bruker)
-------------------------------- */

type ProfileCheck = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
};

export default function Section2StatusAndNextSteps() {
  const { role } = useRole();

  /* --------------------------------
     STATE
  -------------------------------- */

  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [checked, setChecked] = useState(false);

  /* --------------------------------
     ✅ EKTESJEKK: Profil fullført?
     (seksjon 1 + 2 på profil)
  -------------------------------- */

  useEffect(() => {
    async function checkProfile() {
      if (role !== "client" && role !== "trainer") {
        setChecked(true);
        return;
      }

      try {
        const profile = (await getMyProfile()) as ProfileCheck;

        const incomplete =
          !profile.first_name ||
          !profile.last_name ||
          !profile.phone ||
          !profile.birth_date ||
          !profile.address ||
          !profile.postal_code ||
          !profile.city;

        setProfileIncomplete(incomplete);
      } catch (e) {
        // Fail-safe: vis varsel hvis noe feiler
        setProfileIncomplete(true);
      } finally {
        setChecked(true);
      }
    }

    checkProfile();
  }, [role]);

  /* --------------------------------
     Hvis ingen avvik → ikke vis seksjon
  -------------------------------- */

  if (!checked || !profileIncomplete) return null;

  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-sf-muted">
        Varsler & mangler
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/profile" className="block">
          <DashboardCard
            title={
              role === "trainer"
                ? "Trenerprofil ikke fullført"
                : "Kundeprofil ikke fullført"
            }
            icon={<User size={18} />}
            variant="warning"
          >
            <p>
              {role === "trainer"
                ? "Profilen din vises for kunder."
                : "Profilen din vises for treneren din."}
            </p>
            <p className="text-sm text-sf-muted underline">
              Fullfør personopplysninger og adresse
            </p>
          </DashboardCard>
        </Link>
      </div>
    </section>
  );
}