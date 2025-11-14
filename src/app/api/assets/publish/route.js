import ResponseModel from '@/models/ResponseModel';

export async function POST(request) {
  try {
    const { assetId, status } = await request.json();

    if (!assetId || typeof status !== 'string' || !status.trim()) {
      return new Response(
        JSON.stringify(new ResponseModel(400, 'assetId and status are required')),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const normalizedStatus = status.trim();

    return new Response(
      JSON.stringify(
        new ResponseModel(200, 'Publish status updated', {
          assetId,
          status: normalizedStatus,
        }),
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify(new ResponseModel(500, error.message || 'Internal Server Error')),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
