import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getCatalogBySlug } from "@/lib/catalogs";
import type { Category } from "@/lib/catalogs";
import * as XLSX from "xlsx";

async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** Download Excel template for bulk-importing products into a catalog. Template columns vary by category. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const { slug } = await params;

  const catalog = getCatalogBySlug(slug);
  if (!catalog) {
    return Response.json({ error: "Catalog not found" }, { status: 404 });
  }

  const category = catalog.category as Category;

  const { headers, exampleRow, noteRow } = getTemplateForCategory(category);

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow, noteRow]);
  ws["!cols"] = headers.map((_, i) => ({ wch: Math.min(28, Math.max(10, (headers[i]?.length ?? 8) + 2)) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const filename = `catalog-${slug}-template.xlsx`;
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function getTemplateForCategory(category: Category): {
  headers: string[];
  exampleRow: string[];
  noteRow: string[];
} {
  const commonHeaders = ["name", "description", "image_url", "image_url_2", "image_url_3", "gross_wt", "net_wt"];
  const commonExample = ["Example necklace", "Optional short description", "/images/collections/front.jpg", "/images/collections/side.jpg", "/images/collections/detail.jpg", "5.2", "5"];
  const commonNotes = ["Required", "Optional", "Main image (required)", "Optional", "Optional", "Gross weight (g)", "Net weight (g)"];

  if (category === "Gold") {
    return {
      headers: [...commonHeaders, "purity", "making_code", "stones_ct", "stone_rate"],
      exampleRow: [...commonExample, "22k", "AA", "2", "500"],
      noteRow: [...commonNotes, "24k/22k/18k/14k", "AA, BB, CC, DD, EE, FF, GG, HH, II", "Stones in ct", "Rate per ct"],
    };
  }

  if (category === "Diamond") {
    return {
      headers: [...commonHeaders, "purity", "diamond_wt", "diamond_rate", "diamond_wt_2", "diamond_rate_2", "stones_ct", "stone_rate"],
      exampleRow: [...commonExample, "22k", "0.5", "10000", "0.3", "8000", "2", "500"],
      noteRow: [...commonNotes, "24k/22k/18k/14k", "Diamond weight 1 (ct)", "Diamond rate 1 per unit", "Diamond weight 2 (ct)", "Diamond rate 2 per unit", "Stone weight (ct)", "Stone rate per ct"],
    };
  }

  if (category === "Polki") {
    return {
      headers: [...commonHeaders, "purity", "polki_wt", "polki_rate", "diamond_wt", "diamond_rate", "stones_ct", "stone_rate"],
      exampleRow: [...commonExample, "22k", "5.2", "4500", "0.5", "10000", "2", "500"],
      noteRow: [...commonNotes, "24k/22k/18k/14k", "Polki weight (g)", "Polki rate per g", "Diamond weight (ct)", "Diamond rate per unit", "Stone weight (ct)", "Stone rate per ct"],
    };
  }

  if (category === "Silver") {
    return {
      headers: [...commonHeaders, "making_charges", "pricing_type", "mrp"],
      exampleRow: [...commonExample, "50", "formula", ""],
      noteRow: [...commonNotes, "Making Rs/g (if formula)", "formula or mrp", "MRP if pricing_type=mrp"],
    };
  }

  // Fallback: show all columns
  return {
    headers: [...commonHeaders, "purity", "making_code", "stones_ct", "stone_rate", "diamond_wt", "diamond_rate", "diamond_wt_2", "diamond_rate_2", "polki_wt", "polki_rate", "pricing_type", "mrp"],
    exampleRow: [...commonExample, "22k", "AA", "2", "500", "", "", "", "", "", "", "", ""],
    noteRow: [...commonNotes, "24k/22k/18k/14k", "Gold: AA–II", "Stones ct", "Rate per ct", "Diamond wt", "Rate", "Diamond wt 2", "Rate 2", "Polki wt", "Polki rate", "Silver: formula/mrp", "Silver MRP"],
  };
}
