// Initialize Fabric.js canvas
const canvas = new fabric.Canvas("canvas");

// Store points for the Voronoi diagram
const points = [];

// Add a circle on canvas click
canvas.on("mouse:down", (e) => {
  const pointer = canvas.getPointer(e.e);
  const circle = new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 5,
    fill: "red",
    hasControls: false,
    hasBorders: false,
    originX: "center",
    originY: "center",
  });

  points.push({ x: pointer.x, y: pointer.y });
  canvas.add(circle);
});

// Generate Voronoi diagram on button click
document.getElementById("generateVoronoi").addEventListener("click", () => {
  if (points.length === 0)
    return alert("No points to create a Voronoi diagram!");

  // Create Voronoi diagram using d3
  /*const voronoi = d3.voronoi().extent([
    [0, 0],
    [canvas.width, canvas.height],
  ]);
  const diagram = voronoi(points);
*/
  const delaunayPoints = points.map((point) => [point.x, point.y]);
  const delaunay = d3.Delaunay.from(delaunayPoints);
  const diagram = delaunay.voronoi([0, 0, canvas.width, canvas.height]);
  // Clear existing Voronoi lines
  canvas.getObjects("line").forEach((line) => canvas.remove(line));
  const edges = extractEdges(diagram);
  // Draw Voronoi edges
  /*edges.forEach(([p1, p2]) => {
    if (p2) {
      const line = new fabric.Line([p1[0], p1[1], p2[0], p2[1]], {
        stroke: "blue",
        strokeWidth: 1,
      });
      canvas.add(line);
    }
  });*/
  // Iterate over Voronoi cells and draw edges
  for (const polygon of diagram.cellPolygons()) {
    const vertices = Array.from(polygon);

    // Draw edges of each polygon
    for (let i = 0; i < vertices.length; i++) {
      const [x1, y1] = vertices[i];
      const [x2, y2] = vertices[(i + 1) % vertices.length]; // Wrap around to form a closed polygon

      const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: "blue",
        strokeWidth: 1,
      });
      canvas.add(line);
    }
  }
});

function extractEdges(voronoi) {
  // Extract circumcenters and half-edges
  const circumcenters = voronoi.circumcenters;
  const halfedges = voronoi.delaunay.halfedges;
  const triangles = voronoi.delaunay.triangles;

  // Function to get circumcenter for a triangle
  const getCircumcenter = (i) => [
    circumcenters[2 * i],
    circumcenters[2 * i + 1],
  ];

  // Iterate through halfedges to extract Voronoi edges
  const edges = [];
  for (let e = 0; e < halfedges.length; e++) {
    //if (e < halfedges[e]) {
    // Ensure each edge is only processed once
    const t1 = Math.floor(e / 3); // First triangle
    const t2 = Math.floor(halfedges[e] / 3); // Adjacent triangle (if exists)

    const p1 = getCircumcenter(t1);
    const p2 = halfedges[e] === -1 ? null : getCircumcenter(t2); // Handle edges at boundaries

    // Add edge
    if (p2) {
      edges.push([p1, p2]);
    }
    // }
  }
  return edges;
}
