export const Experience = () => {
  const cameraControls = useRef();
  const { cameraZoomed } = useChat();

  useEffect(() => {
    cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 2.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <Environment preset="sunset" />
      <Suspense fallback={null}>
        <Dots position-y={1.75} position-x={-0.02} />
        <Avatar position={[0, -1.2, 0]} scale={1.2} />
      </Suspense>
      <ContactShadows opacity={0.7} position={[0, -1.3, 0]} />
    </>
  );
};
