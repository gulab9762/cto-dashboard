interface GraphQLError {
    message: string;
    locations?: { line: number; column: number }[];
    path?: (string | number)[];
}

interface GraphQLResponse<T> {
    data?: T;
    errors?: GraphQLError[];
}

export async function graphqlRequest<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql';
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            query,
            variables
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: GraphQLResponse<T> = await response.json();
    
    if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
    }
    
    if (!result.data) {
        throw new Error('No data returned from API');
    }
    
    return result.data;
}
