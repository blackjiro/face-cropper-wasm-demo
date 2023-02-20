use image::{DynamicImage, GenericImageView, GrayImage, ImageBuffer, Rgba};
use rustface::{read_model, Detector, FaceInfo, ImageData};
use wasm_bindgen::prelude::*;

const MODEL_BYTES: &[u8] = include_bytes!("seeta_fd_frontal_v1.0.bin");

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
) -> u32 {
  let img = image::load_from_memory(data).unwrap();
  let cropped_img = crop_image_circle2(img, x, y, face_width, face_height);
  let (width, height) = cropped_img.dimensions();
  return width + height;
}

fn crop_image_circle2(
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
