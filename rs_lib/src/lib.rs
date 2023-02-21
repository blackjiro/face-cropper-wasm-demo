use base64::{engine::general_purpose, Engine as _};
use image::{DynamicImage, GenericImageView, GrayImage, ImageBuffer, Rgba};
use rustface::{read_model, Detector, FaceInfo, ImageData};
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
  return a + b;
}
#[wasm_bindgen]
pub fn load_image(
  data: &[u8],
  x: u32,
  y: u32,
  face_width: u32,
  face_height: u32,
) -> String {
  let img = image::load_from_memory(data).unwrap();
  let cropped_img = crop_image_circle(img, x, y, face_width, face_height);
  get_base64(cropped_img)
}

#[wasm_bindgen]
pub fn load_image2(
  data: &[u8],
  center_x: f32,
  center_y: f32,
  radius_on_x: f32,
) -> String {
  let img = image::load_from_memory(data).unwrap();
  let cropped_img =
    crop_image_circle_by_ratio(img, center_x, center_y, radius_on_x);
  get_base64(cropped_img)
}

#[wasm_bindgen]
pub fn crop_face(data: &[u8]) -> u32 {
  let img = image::load_from_memory(data).unwrap();
  let cropped_img = generate_face_cropped_image(img);
  let (width, height) = cropped_img.dimensions();
  return width + height;
}

fn get_base64(img: ImageBuffer<Rgba<u8>, Vec<u8>>) -> String {
  let mut buffer = vec![];
  let dynamic_image = image::DynamicImage::ImageRgba8(img);
  dynamic_image
    .write_to(&mut buffer, image::ImageOutputFormat::Png)
    .unwrap();
  let base64 = general_purpose::STANDARD_NO_PAD.encode(&buffer);
  let res_base64 =
    format!("data:image/png;base64,{}", base64.replace("\r\n", ""));
  res_base64
}

fn generate_face_cropped_image(
  image: DynamicImage,
) -> ImageBuffer<image::Rgba<u8>, Vec<u8>> {
  let mut detector = build_detector();
  let face = detect_single_face(&mut *detector, &image.to_luma8());
  let x = face.bbox().x() as u32;
  let y = face.bbox().y() as u32;
  let width = face.bbox().width();
  let height = face.bbox().height();
  let cropped_img = crop_image_circle(image, x, y, width, height);
  cropped_img
}
fn get_model_bytes() -> &'static [u8] {
  include_bytes!("./seeta_fd_frontal_v1.0.bin")
}

fn build_detector() -> Box<dyn Detector> {
  let model_bytes: &[u8] = get_model_bytes();
  let model = read_model(model_bytes).unwrap();
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
  start_x: u32,
  start_y: u32,
  face_width: u32,
  face_height: u32,
) -> ImageBuffer<image::Rgba<u8>, Vec<u8>> {
  let (width, height) = image.dimensions();
  let center_x = start_x + face_width / 2;
  let center_y = start_y + face_height / 2;
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

fn crop_image_circle_by_ratio(
  image: DynamicImage,
  center_x: f32,
  center_y: f32,
  radius_on_x: f32,
) -> ImageBuffer<image::Rgba<u8>, Vec<u8>> {
  let (width, height) = image.dimensions();
  let center_x = (width as f32 * center_x).floor() as u32;
  let center_y = (height as f32 * center_y).floor() as u32;
  let radius = radius_on_x * width as f32;

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
