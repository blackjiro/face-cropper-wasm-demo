use image::{DynamicImage, GenericImageView, GrayImage, ImageBuffer, Rgba};
use rustface::{read_model, Detector, FaceInfo, ImageData};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
  return a + b;
}
#[wasm_bindgen]
pub fn load_image(data: &[u8]) -> u32 {
  let img = match image::load_from_memory(data) {
    Ok(img) => img,
    Err(message) => {
      println!("Failed to read image: {}", message);
      std::process::exit(1)
    }
  };
  let cropped_img = generate_face_cropped_image(img);
  let (width, height) = cropped_img.dimensions();
  return width + height;
}

fn generate_face_cropped_image(
  image: DynamicImage,
) -> ImageBuffer<image::Rgba<u8>, Vec<u8>> {
  let mut detector = build_detector();
  let face = detect_single_face(&mut *detector, &image.to_luma8());
  let cropped_img = crop_image_circle(image, &face);
  cropped_img
}

fn build_detector() -> Box<dyn Detector> {
  const MODEL_BYTES: &[u8] = include_bytes!("seeta_fd_frontal_v1.0.bin");
  let model = read_model(MODEL_BYTES).unwrap();
  let mut detector = rustface::create_detector_with_model(model);
  detector.set_min_face_size(20);
  detector.set_score_thresh(2.0);
  detector.set_pyramid_scale_factor(0.8);
  detector.set_slide_window_step(4, 4);
  detector
}

fn detect_single_face(
  detector: &mut dyn Detector,
  gray: &GrayImage,
) -> FaceInfo {
  let (width, height) = gray.dimensions();
  let mut image = ImageData::new(gray, width, height);
  let faces = detector.detect(&mut image);
  println!("Found {} faces", faces.len(),);
  faces[0].clone()
}

fn crop_image_circle(
  image: DynamicImage,
  face: &FaceInfo,
) -> ImageBuffer<image::Rgba<u8>, Vec<u8>> {
  let (width, height) = image.dimensions();
  let face_height = face.bbox().height();
  let face_width = face.bbox().width();
  let center_x = face.bbox().x() as u32 + face_width / 2;
  let center_y = face.bbox().y() as u32 + face_height / 2;
  let radius = ((face_width / 2) * 2).min((face_height / 2) * 2) as f32;

  let mut cropped_img = ImageBuffer::new(width, height);

  for (x, y, pixel) in image.pixels() {
    let distance_from_center =
      ((x - center_x).pow(2) + (y - center_y).pow(2)) as f32;
    if distance_from_center <= radius.powi(2) {
      cropped_img.put_pixel(x, y, pixel);
    } else {
      cropped_img.put_pixel(x, y, Rgba([0, 0, 0, 0]));
    }
  }
  cropped_img
}
