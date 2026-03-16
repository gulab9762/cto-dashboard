async function getOrganizationMetrics(orgId) {
  const query = `
    query GetMetrics($orgId: ID!) {
      organization(id: $orgId) {
        metrics(days: 30) {
          prsMerged
          averageCycleTime
        }
      }
    }
  `;
  
  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { orgId }
    })
  });
  
  return response.json();
}

console.log("Testing GraphQL endpoint on local...");
getOrganizationMetrics("1")
  .then(res => console.log("Response:", JSON.stringify(res, null, 2)))
  .catch(err => console.error("Error:", err));
