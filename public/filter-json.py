import json
import argparse
import os

def filter_pipeline(input_path: str, output_path: str, pipeline_to_remove: str):
    """
    Đọc một file JSON, loại bỏ các kết quả có pipelineId được chỉ định,
    và lưu vào một file mới.

    Args:
        input_path (str): Đường dẫn đến file JSON đầu vào.
        output_path (str): Đường dẫn đến file JSON đầu ra.
        pipeline_to_remove (str): ID của pipeline cần loại bỏ (ví dụ: 'pipeline_A').
    """
    try:
        # Mở và đọc file JSON đầu vào với encoding utf-8
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Đã đọc thành công file: {input_path}")

    except FileNotFoundError:
        print(f"❌ Lỗi: Không tìm thấy file tại '{input_path}'")
        return
    except json.JSONDecodeError:
        print(f"❌ Lỗi: File '{input_path}' không phải là một file JSON hợp lệ.")
        return

    # Tạo một danh sách mới để chứa dữ liệu đã được lọc
    filtered_data = []

    # Lặp qua từng mục trong dữ liệu gốc
    for item in data:
        # Sử dụng list comprehension để lọc danh sách 'results'
        # Giữ lại các 'result' nếu 'pipelineId' của nó KHÔNG phải là pipeline cần xóa
        filtered_results = [
            result for result in item.get('results', [])
            if result.get('pipelineId') != pipeline_to_remove
        ]

        # Tạo một mục mới với danh sách 'results' đã được lọc
        new_item = {
            'setId': item.get('setId'),
            'original': item.get('original'),
            'results': filtered_results
        }
        filtered_data.append(new_item)

    try:
        # Ghi dữ liệu đã lọc vào file đầu ra
        with open(output_path, 'w', encoding='utf-8') as f:
            # indent=4 để file JSON có định dạng đẹp, dễ đọc
            # ensure_ascii=False để giữ lại các ký tự Unicode (nếu có)
            json.dump(filtered_data, f, indent=4, ensure_ascii=False)
        print(f"🎉 Đã lọc và lưu kết quả vào file: {output_path}")

    except IOError as e:
        print(f"❌ Lỗi: Không thể ghi file vào '{output_path}'. Lỗi: {e}")


if __name__ == "__main__":
    # Thiết lập trình phân tích cú pháp đối số dòng lệnh
    parser = argparse.ArgumentParser(
        description="Lọc dữ liệu trong file JSON bằng cách loại bỏ một pipelineId cụ thể."
    )
    
    # Đối số bắt buộc: đường dẫn file đầu vào
    parser.add_argument(
        "input_file",
        help="Đường dẫn đến file JSON đầu vào."
    )

    # Đối số tùy chọn: đường dẫn file đầu ra
    parser.add_argument(
        "-o", "--output_file",
        help="Đường dẫn đến file JSON đầu ra. Nếu không cung cấp, "
             "tên file sẽ được tự động tạo dựa trên tên file đầu vào (ví dụ: data_filtered.json)."
    )

    args = parser.parse_args()

    # Nếu không cung cấp đường dẫn file đầu ra, tự động tạo một tên file
    if args.output_file:
        output_file_path = args.output_file
    else:
        # Tách tên file và phần mở rộng để tạo tên mới
        base, ext = os.path.splitext(args.input_file)
        output_file_path = f"{base}_filtered{ext}"

    # Gọi hàm để thực hiện việc lọc
    filter_pipeline(args.input_file, output_file_path, 'pipeline_A')