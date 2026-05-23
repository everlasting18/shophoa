import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paths: string[] = body.paths ?? (body.path ? [body.path] : ["/"]);
    paths.forEach((p) => revalidatePath(p));
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ revalidated: true, paths });
  } catch {
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}
