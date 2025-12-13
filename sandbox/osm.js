import {
    Globe,
    control,
    Vector,
    LonLat,
    Entity,
    OpenStreetMap,
    EmptyTerrain,
    RgbTerrain,
    GlobusRgbTerrain,
    Object3d,
    mercator,
    Bing,
    GeoVideo,
    XYZ,
    utils,
    PlanetCamera,
    Framebuffer,
    input,
    Program,
    Vec4,
    Vec2,
    GeoImage,
    WMS
} from "../../lib/og.es.js";
var ne = new WMS("Natural Earth", {
        visibility: true,
        isBaseLayer: false,
        url: 'https://services.sentinel-hub.com/ogc/wms/0635c213-17a1-48ee-aef7-9d1731695a54',
        layers: 'AWS_NO2-VISUALISATION',
        version: '1.3.0',
        opacity: 0.7,
        extra: {
            transparent: true
        }
    });

const globus = new Globe({
    target: "earth",
    name: "Earth",
   // terrain: new GlobusRgbTerrain(),
    layers: [new OpenStreetMap(),ne],
    atmosphereEnabled: false,
     sun: { active: false },
    fontsSrc: "../../res/fonts",
});

globus.planet.addControl(new control.TimelineControl());
globus.planet.addControl(new control.CompassButton());
globus.planet.addControl(new control.DebugInfo());
globus.planet.addControl(new control.LayerSwitcher());
globus.planet.addControl(new control.DrawingSwitcher());

let tempCamera = new PlanetCamera(globus.planet);

function saveCamera() {

    let cam = globus.planet.camera
    tempCamera.copy(cam);
    depthHandler.camera.copy(cam);
}

function restoreCamera() {
    globus.planet.camera.copy(tempCamera);
}

globus.planet.renderer.events.on("charkeypress", input.KEY_C, () => {
    saveCamera();
});

globus.planet.renderer.events.on("charkeypress", input.KEY_V, () => {
    restoreCamera();
});

let depthHandler = new control.CameraDepthHandler();

globus.planet.addControl(depthHandler);

let depthPreview = new control.FramebufferPreview({
    title: "depthHandler",
    framebuffer: depthHandler.framebuffer,
    image: `float linearizeDepth(float z, float near, float far) {
                float ndcZ = z * 2.0 - 1.0;
                return (2.0 * near * far) / (far + near - ndcZ * (far - near));
            }

            void mainImage(out vec4 fragColor, in vec2 fragCoord){
                float near = 10.0;
                float far = 10000.0;
                float depth = texture(inputTexture, fragCoord).r;
                float linearDepth = linearizeDepth(depth, near, far);
                float normalized = (linearDepth - near) / (far - near);
                fragColor = vec4(vec3(normalized), 1.0);
            }`
});

globus.planet.addControl(depthPreview);
globus.planet.addControl(new control.KeyboardNavigation({
        camera: depthHandler.camera
    })
);

// let toneMappingFramebufferPreview = new control.FramebufferPreview({
//     title: "toneMappingFramebuffer",
//     framebuffer: globus.renderer.toneMappingFramebuffer,
//     flippedUV: true
// });
// globus.planet.addControl(toneMappingFramebufferPreview);

// let pickingFramebufferPreview = new control.FramebufferPreview({
//     title: "pickingFramebuffer",
//     framebuffer: globus.renderer.pickingFramebuffer,
//     flippedUV: true
// });
// globus.planet.addControl(pickingFramebufferPreview);

globus.planet.renderer.controls.SimpleSkyBackground.colorOne = "black";
globus.planet.renderer.controls.SimpleSkyBackground.colorTwo = "black";