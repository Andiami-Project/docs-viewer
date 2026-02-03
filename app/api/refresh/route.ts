import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Revalidate all docs pages
    revalidatePath('/project/[projectName]/docs-list', 'page');

    return NextResponse.json({
      revalidated: true,
      message: 'Documentation cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        message: 'Error clearing cache',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
