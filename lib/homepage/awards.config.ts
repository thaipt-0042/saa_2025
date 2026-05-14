export interface AwardConfig {
  slug: string
  title: string
  description: string
  imageBg: string
  imageNameOverlay: string
  quantity?: string
  unit?: string
  value?: string | string[]
  valueLabel?: string | string[]
}

export const AWARDS: AwardConfig[] = [
  {
    slug: 'top-talent',
    title: 'Top Talent',
    description:
      'Vinh danh những cá nhân xuất sắc với năng lực vượt trội, đóng góp bền vững và tinh thần phát triển không ngừng.',
    imageBg: '/assets/homepage/images/award-bg.png',
    imageNameOverlay: '/assets/homepage/images/award-name-top-talent.png',
    quantity: '10',
    unit: 'Đơn vị',
    value: '7.000.000 VNĐ',
    valueLabel: 'cho mỗi giải thưởng',
  },
  {
    slug: 'top-project',
    title: 'Top Project',
    description:
      'Tôn vinh những dự án tiêu biểu đạt thành tích xuất sắc về chất lượng, tiến độ và giá trị mang lại cho khách hàng.',
    imageBg: '/assets/homepage/images/award-bg.png',
    imageNameOverlay: '/assets/homepage/images/award-name-top-project.png',
    quantity: '02',
    unit: 'Tập thể',
    value: '15.000.000 VNĐ',
    valueLabel: 'cho mỗi giải thưởng',
  },
  {
    slug: 'top-project-leader',
    title: 'Top Project Leader',
    description:
      'Ghi nhận những người dẫn dắt dự án với kỹ năng lãnh đạo nổi bật, khả năng quản trị hiệu quả và truyền cảm hứng cho đội nhóm.',
    imageBg: '/assets/homepage/images/award-bg.png',
    imageNameOverlay: '/assets/homepage/images/award-name-top-project-leader.png',
    quantity: '03',
    unit: 'Cá nhân',
    value: '7.000.000 VNĐ',
    valueLabel: 'cho mỗi giải thưởng',
  },
  {
    slug: 'best-manager',
    title: 'Best Manager',
    description:
      'Vinh danh nhà quản lý tiêu biểu với tầm nhìn chiến lược, năng lực phát triển nhân tài và văn hóa đội nhóm xuất sắc.',
    imageBg: '/assets/homepage/images/award-bg.png',
    imageNameOverlay: '/assets/homepage/images/award-name-best-manager.png',
    quantity: '01',
    unit: 'Cá nhân',
    value: '10.000.000 VNĐ',
    valueLabel: 'cho mỗi giải thưởng',
  },
  {
    slug: 'signature-2025-creator',
    title: 'Signature 2025 - Creator',
    description:
      'Tôn vinh những cá nhân sáng tạo, đổi mới và tạo ra dấu ấn đặc biệt, góp phần định hình bản sắc Sun* năm 2025.',
    imageBg: '/assets/homepage/images/award-bg.png',
    imageNameOverlay: '/assets/homepage/images/award-name-signature-2025-creator.png',
    quantity: '01',
    unit: '',
    value: ['5.000.000 VNĐ', '8.000.000 VNĐ'],
    valueLabel: ['cá nhân', 'tập thể'],
  },
  {
    slug: 'mvp-most-valuable-person',
    title: 'MVP (Most Valuable Person)',
    description:
      'Giải thưởng cao quý nhất, vinh danh cá nhân có đóng góp toàn diện và ảnh hưởng lớn nhất đến sự phát triển của Sun*.',
    imageBg: '/assets/homepage/images/award-bg.png',
    imageNameOverlay: '/assets/homepage/images/award-name-mvp.png',
    quantity: '01',
    unit: '',
    value: '15.000.000 VNĐ',
    valueLabel: 'cho mỗi giải thưởng',
  },
]
