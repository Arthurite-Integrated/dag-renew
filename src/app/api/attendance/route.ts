import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    console.log('=== API ROUTE: Fetching attendance data ===');

    // Fetch data from AWS API
    const response = await axios.get(
      'https://0p3ep5f22f.execute-api.us-east-1.amazonaws.com/dev/',
      {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('✅ AWS API GET Response:', {
      status: response.status,
      dataLength: response.data?.data?.Items?.length || 0
    });

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: response.data
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.log('=== API ROUTE GET ERROR ===');
    console.error('Error details:', error);

    if (error.response) {
      console.log('AWS API Error Status:', error.response.status);
      console.log('AWS API Error Data:', error.response.data);
      
      return NextResponse.json(
        {
          error: 'AWS API Error',
          message: error.response.data?.message || `AWS API returned status ${error.response.status}`,
          details: error.response.data
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      console.log('Network error - no response received');
      return NextResponse.json(
        {
          error: 'Network Error',
          message: 'Unable to reach AWS API. Please check your internet connection.'
        },
        { status: 503 }
      );
    } else {
      console.log('Request setup error:', error.message);
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error.message || 'An unexpected error occurred'
        },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    
    console.log('=== API ROUTE: Received attendance data ===');
    console.log('Request body:', {
      ...body,
      image_url: body.image_url ? body.image_url.substring(0, 50) + '...[truncated]' : 'No image'
    });

    // Validate required fields
    const requiredFields = ['id', 'image_url', 'department', 'location', 'location_address', 'timestamp', 'ip_address'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          missing: missingFields 
        },
        { status: 400 }
      );
    }

    // Forward the request to your AWS API
    console.log('=== Forwarding to AWS API ===');
    const response = await axios.post(
      'https://0p3ep5f22f.execute-api.us-east-1.amazonaws.com/dev/',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('✅ AWS API Response:', {
      status: response.status,
      data: response.data
    });

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        message: 'Attendance submitted successfully',
        data: response.data
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.log('=== API ROUTE ERROR ===');
    console.error('Error details:', error);

    if (error.response) {
      // AWS API returned an error
      console.log('AWS API Error Status:', error.response.status);
      console.log('AWS API Error Data:', error.response.data);
      
      return NextResponse.json(
        {
          error: 'AWS API Error',
          message: error.response.data?.message || `AWS API returned status ${error.response.status}`,
          details: error.response.data
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      // Network error
      console.log('Network error - no response received');
      return NextResponse.json(
        {
          error: 'Network Error',
          message: 'Unable to reach AWS API. Please check your internet connection.'
        },
        { status: 503 }
      );
    } else {
      // Other error
      console.log('Request setup error:', error.message);
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error.message || 'An unexpected error occurred'
        },
        { status: 500 }
      );
    }
  }
}

// Handle preflight OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}