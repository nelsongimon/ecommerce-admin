import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

interface IParams {
  params: { 
    storeId: string;
    colorId: string;
  }
}

export async function GET(  
  req: Request,
  { params }: IParams
) {
  try { 
    if (!params.colorId) {
      return new NextResponse("Color ID is required", { status: 400 });
    }

    const color = await prismadb.color.findUnique({
      where: {
        id: params.colorId,
      }
    });

    return NextResponse.json(color);

  } catch (error) {
    console.log("[COLORS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH (
  req: Request, 
  { params } : IParams
) {
  try { 
    const { userId } = auth();
    const body = await req.json();
    const { name , value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401});
    }
    
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value color URL is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const colorUpdated = await prismadb.color.updateMany({
      where: {
        id: params.colorId,
      },
      data: {
        name,
        value
      }
    });

    return NextResponse.json(colorUpdated);

  } catch (error) {
    console.log("[COLORS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: IParams
) {
  try { 
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unathenticated", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!params.colorId) {
      return new NextResponse("Color ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const colorDeleted = await prismadb.color.deleteMany({
      where: {
        id: params.colorId,
      }
    });

    return NextResponse.json(colorDeleted);

  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}